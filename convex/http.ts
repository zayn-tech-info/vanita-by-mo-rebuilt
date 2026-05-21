import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import Stripe from "stripe";
import { clerkWebhook } from "./webhooks";

const http = httpRouter();

http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: clerkWebhook,
});

http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const skipVerify = process.env.STRIPE_WEBHOOK_SKIP_VERIFY === "true" || process.env.STRIPE_WEBHOOK_SKIP_VERIFY === "1";
    const primarySecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    const altSecret = process.env.STRIPE_WEBHOOK_SECRET_ALT?.trim();

    if (!stripeSecretKey) {
      console.error("Missing STRIPE_SECRET_KEY");
      return new Response("Server configuration error", { status: 500 });
    }
    if (!skipVerify && !primarySecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET (set STRIPE_WEBHOOK_SKIP_VERIFY=true only for local dev)");
      return new Response("Server configuration error", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stripe API version
      apiVersion: "2023-10-16" as any,
    });

    // Use raw bytes then decode to string so the body matches exactly what Stripe signed (no normalization).
    const rawBytes = await request.arrayBuffer();
    const payload = new TextDecoder("utf-8").decode(rawBytes);

    let event: Stripe.Event;

    if (skipVerify) {
      // DEV ONLY: skip signature verification. Never set STRIPE_WEBHOOK_SKIP_VERIFY in production.
      console.warn("Stripe webhook: signature verification SKIPPED (STRIPE_WEBHOOK_SKIP_VERIFY). Do not use in production.");
      try {
        const parsed = JSON.parse(payload) as { type?: string; data?: { object?: unknown } };
        if (!parsed?.type || !parsed?.data?.object) {
          return new Response(JSON.stringify({ error: "Invalid webhook payload (skip-verify mode)" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        event = parsed as Stripe.Event;
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON (skip-verify mode)" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      const signature = request.headers.get("Stripe-Signature");
      if (!signature) {
        return new Response(JSON.stringify({ error: "Missing Stripe-Signature header" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const secretsToTry = [primarySecret!, ...(altSecret ? [altSecret] : [])];
      let verified: Stripe.Event | null = null;
      let lastError = "";
      for (const secret of secretsToTry) {
        try {
          verified = await stripe.webhooks.constructEventAsync(payload, signature, secret);
          break;
        } catch (err: unknown) {
          lastError = err instanceof Error ? err.message : "Invalid signature";
        }
      }
      if (!verified) {
        console.error("Stripe webhook signature verification failed:", lastError, "payloadLength:", payload.length);
        return new Response(
          JSON.stringify({
            error: "Webhook signature verification failed",
            detail: lastError,
            hint: "Use Dashboard endpoint (not CLI), copy Signing secret with no extra spaces. Payload length: " + payload.length,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      event = verified;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;
      const sessionId = session.metadata?.sessionId;

      if (!orderId) {
        console.error("Stripe session missing metadata.orderId");
        return new Response(null, { status: 200 });
      }

      const shipping = (session as Stripe.Checkout.Session & { shipping_details?: { address?: { line1?: string; city?: string; state?: string; postal_code?: string; country?: string }; name?: string } }).shipping_details;
      const addr = shipping?.address;
      const hasShippingFromStripe = addr?.line1 != null && addr?.country != null;

      if (hasShippingFromStripe) {
        const shippingAddress = {
          street: addr?.line1 ?? "",
          city: addr?.city ?? "",
          state: addr?.state ?? "",
          zipCode: addr?.postal_code ?? "",
          country: addr?.country ?? "",
        };
        const customerName =
          (session.customer_details as { name?: string } | null)?.name ??
          shipping?.name ??
          "Customer";
        const customerEmail =
          session.customer_details?.email ?? session.customer_email ?? "";
        await ctx.runMutation(api.orders.completeFromStripe, {
          orderId: orderId as Id<"orders">,
          stripeSessionId: session.id,
          customerName,
          customerEmail,
          shippingAddress,
        });
      } else {
        await ctx.runMutation(api.orders.completeFromStripeCheckoutOnly, {
          orderId: orderId as Id<"orders">,
          stripeSessionId: session.id,
        });
      }

      const order = await ctx.runQuery(api.orders.getById, { id: orderId as Id<"orders"> });
      await ctx.runMutation(api.cart.clearCart, {
        sessionId: sessionId ?? "",
        userId: order?.userId,
      });

      if (order?.appliedRedeemCode) {
        try {
          await ctx.runMutation(api.redeemCodes.recordUsage, {
            code: order.appliedRedeemCode,
          });
        } catch (e) {
          console.error("Redeem code record usage failed:", e);
        }
      }
      try {
        await ctx.runAction(api.email.sendOrderConfirmation, {
          orderId: orderId as Id<"orders">,
        });
      } catch (e) {
        console.error("Order confirmation email failed:", e);
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      let orderId = paymentIntent.metadata?.orderId as Id<"orders"> | undefined;
      const sessionId = paymentIntent.metadata?.sessionId as string | undefined;

      // Fallback: find order by paymentIntentId if metadata.orderId is missing
      if (!orderId) {
        const order = await ctx.runQuery(api.orders.getByPaymentIntentId, {
          paymentIntentId: paymentIntent.id,
        });
        if (order) orderId = order._id;
      }

      if (orderId) {
        await ctx.runMutation(api.orders.completeOrderFromPaymentIntent, {
          orderId,
        });
        const order = await ctx.runQuery(api.orders.getById, { id: orderId });
        await ctx.runMutation(api.cart.clearCart, {
          sessionId: sessionId ?? "",
          userId: order?.userId,
        });
        if (order?.appliedRedeemCode) {
          try {
            await ctx.runMutation(api.redeemCodes.recordUsage, {
              code: order.appliedRedeemCode,
            });
          } catch (e) {
            console.error("Redeem code record usage failed:", e);
          }
        }
        try {
          await ctx.runAction(api.email.sendOrderConfirmation, { orderId });
        } catch (e) {
          console.error("Order confirmation email failed:", e);
        }
      }
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
