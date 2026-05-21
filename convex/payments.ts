import { action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api } from "./_generated/api";
import Stripe from "stripe";

const shippingAddressSchema = v.object({
  street: v.string(),
  city: v.string(),
  state: v.string(),
  zipCode: v.string(),
  country: v.string(),
});

export const createCheckoutSession = action({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
    items: v.array(
      v.object({
        productId: v.union(v.number(), v.string(), v.id("products")),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.optional(v.string()),
        size: v.optional(v.string()),
        color: v.optional(v.string()),
      })
    ),
    subtotal: v.number(),
    shippingCost: v.number(),
    total: v.number(),
    // When provided, we collect shipping on our site and Stripe only shows payment (no duplicate address form)
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    shippingAddress: v.optional(shippingAddressSchema),
    redeemCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) {
      throw new ConvexError("Your cart is empty. Add items before checkout.");
    }

    const clientUrl = process.env.CLIENT_URL;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!clientUrl || !stripeSecretKey) {
      throw new ConvexError("Payment is temporarily unavailable. Please try again later.");
    }

    let total = args.subtotal + args.shippingCost;
    let appliedRedeemCode: string | undefined;
    if (args.redeemCode?.trim()) {
      const code = args.redeemCode.trim().toUpperCase();
      const result = await ctx.runQuery(api.redeemCodes.validate, {
        code,
        subtotal: args.subtotal,
      });
      if (!result.valid) throw new ConvexError(result.message);
      total = args.subtotal + args.shippingCost - (result.discountAmount ?? 0);
      appliedRedeemCode = code;
    }

    const hasShippingFromSite =
      args.customerName &&
      args.customerEmail &&
      args.shippingAddress &&
      args.shippingAddress.street.trim() !== "" &&
      args.shippingAddress.country.trim() !== "";

    // 1. Create pending order: with shipping if we collected it on our site, else placeholder (Stripe will collect)
    const orderId = hasShippingFromSite
      ? await ctx.runMutation(api.orders.createPendingOrderWithShipping, {
          userId: args.userId,
          sessionId: args.sessionId,
          customerName: args.customerName!,
          customerEmail: args.customerEmail!,
          shippingAddress: args.shippingAddress!,
          items: args.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            image: i.image ?? "",
          })),
          subtotal: args.subtotal,
          shippingCost: args.shippingCost,
          total,
          appliedRedeemCode,
        })
      : await ctx.runMutation(api.orders.createPendingOrder, {
          userId: args.userId,
          sessionId: args.sessionId,
          items: args.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            image: i.image ?? "",
          })),
          subtotal: args.subtotal,
          shippingCost: args.shippingCost,
          total,
          appliedRedeemCode,
        });

    const stripe = new Stripe(stripeSecretKey, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stripe API version
      apiVersion: "2023-10-16" as any,
    });

    const lineItems: Stripe.Checkout.SessionCreateParams["line_items"] =
      args.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

    if (args.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            description: "Standard delivery",
          },
          unit_amount: Math.round(args.shippingCost * 100),
        },
        quantity: 1,
      });
    }
    const discountAmount = args.subtotal + args.shippingCost - total;
    if (discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Discount",
            description: appliedRedeemCode ? `Code ${appliedRedeemCode}` : "Discount",
          },
          unit_amount: -Math.round(discountAmount * 100),
        },
        quantity: 1,
      });
    }

    const allowedCountries = [
      "US", "GB", "CA", "NG", "GH", "KE", "ZA", "AU", "DE", "FR", "ES", "IT",
      "NL", "BE", "IE", "AT", "PT", "PL", "SE", "CH", "IN", "AE", "SG", "MY", "JP",
    ];

    // 2. Create Stripe Checkout Session: only collect shipping on Stripe if we didn’t collect it on our site
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${clientUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout?cancelled=1`,
      metadata: {
        orderId: orderId,
        sessionId: args.sessionId,
      },
    };

    if (!hasShippingFromSite) {
      sessionParams.shipping_address_collection = {
        allowed_countries: allowedCountries as Stripe.Checkout.SessionCreateParams["shipping_address_collection"] extends { allowed_countries: infer C } ? C : never,
      };
    } else if (args.customerEmail) {
      sessionParams.customer_email = args.customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new ConvexError("Unable to start checkout. Please try again.");
    }

    return { url: session.url };
  },
});

/** Create pending order with shipping (embedded flow). Validates redeem code on backend. */
export const createOrderWithShipping = action({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
    items: v.array(
      v.object({
        productId: v.union(v.number(), v.string(), v.id("products")),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        size: v.optional(v.string()),
        color: v.optional(v.string()),
        image: v.string(),
      })
    ),
    subtotal: v.number(),
    shippingCost: v.number(),
    total: v.number(),
    redeemCode: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    let total = args.subtotal + args.shippingCost;
    let appliedRedeemCode: string | undefined;
    if (args.redeemCode?.trim()) {
      const code = args.redeemCode.trim().toUpperCase();
      const result = await ctx.runQuery(api.redeemCodes.validate, {
        code,
        subtotal: args.subtotal,
      });
      if (!result.valid) throw new ConvexError(result.message);
      total = args.subtotal + args.shippingCost - (result.discountAmount ?? 0);
      appliedRedeemCode = code;
    }
    return await ctx.runMutation(api.orders.createPendingOrderWithShipping, {
      userId: args.userId,
      sessionId: args.sessionId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      shippingAddress: args.shippingAddress,
      items: args.items,
      subtotal: args.subtotal,
      shippingCost: args.shippingCost,
      total,
      appliedRedeemCode,
    });
  },
});

// Create a PaymentIntent for embedded Payment Element (user stays on your site)
export const createPaymentIntent = action({
  args: {
    orderId: v.id("orders"),
    amountInCents: v.number(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new ConvexError("Payment is temporarily unavailable. Please try again later.");
    }

    const stripe = new Stripe(stripeSecretKey, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stripe API version
      apiVersion: "2023-10-16" as any,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: args.amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: args.orderId,
        sessionId: args.sessionId,
      },
    });

    await ctx.runMutation(api.orders.setPaymentIntentId, {
      orderId: args.orderId,
      paymentIntentId: paymentIntent.id,
    });

    if (!paymentIntent.client_secret) {
      throw new ConvexError("Unable to start payment. Please try again.");
    }

    return { clientSecret: paymentIntent.client_secret };
  },
});
