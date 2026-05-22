import { httpRouter } from "convex/server";
import { clerkWebhook } from "./webhooks";
import { components, api } from "./_generated/api";
import { registerRoutes } from "@convex-dev/stripe";
import type Stripe from "stripe";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: clerkWebhook,
});

registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
  events: {
    "checkout.session.completed": async (ctx, event) => {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId as Id<"orders"> | undefined;
      const sessionId = session.metadata?.sessionId;
      const userId = session.metadata?.userId;

      if (!orderId) {
        console.error("checkout.session.completed: missing orderId in metadata");
        return;
      }

      const shipping = (
        session as Stripe.Checkout.Session & {
          shipping_details?: {
            name?: string | null;
            address?: Stripe.Address | null;
          };
        }
      ).shipping_details;
      const addr = shipping?.address ?? session.customer_details?.address;
      const customerName =
        session.customer_details?.name ?? shipping?.name ?? "Customer";
      const customerEmail =
        session.customer_details?.email ?? session.customer_email ?? "";

      const shippingAddress = {
        street: addr?.line1 ?? "",
        city: addr?.city ?? "",
        state: addr?.state ?? "",
        zipCode: addr?.postal_code ?? "",
        country: addr?.country ?? "",
      };

      const completed = await ctx.runMutation(
        api.orders.completeFromStripeCheckout,
        {
          orderId,
          stripeCheckoutSessionId: session.id,
          customerName,
          customerEmail,
          shippingAddress,
        },
      );

      if (completed) {
        await ctx.runMutation(api.cart.clearCart, {
          sessionId: sessionId ?? "",
          userId: userId || undefined,
        });

        try {
          await ctx.runAction(api.email.sendOrderConfirmation, { orderId });
        } catch (e) {
          console.error("Order confirmation email failed:", e);
        }
      }
    },
  },
});

export default http;
