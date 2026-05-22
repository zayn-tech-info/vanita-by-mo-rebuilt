"use node";

import { action } from "./_generated/server";
import { components, api } from "./_generated/api";
import { StripeSubscriptions } from "@convex-dev/stripe";
import { v, ConvexError } from "convex/values";
import Stripe from "stripe";
import type { Id } from "./_generated/dataModel";

const stripeClient = new StripeSubscriptions(components.stripe, {});

const SHIPPING_COUNTRIES = [
  "US",
  "GB",
  "CA",
  "NG",
  "GH",
  "KE",
  "ZA",
  "AU",
  "DE",
  "FR",
  "ES",
  "IT",
  "NL",
  "BE",
  "IE",
  "AT",
  "PT",
  "PL",
  "SE",
  "CH",
  "IN",
  "AE",
  "SG",
  "MY",
  "JP",
] as const;

function getClientUrl() {
  const url = process.env.APP_CLIENT_URL?.replace(/\/$/, "");
  if (!url) {
    throw new ConvexError(
      "Checkout is unavailable. Set APP_CLIENT_URL in convex/.env or Convex environment variables.",
    );
  }
  return url;
}

//  Cart checkout → Stripe Hosted Checkout (dynamic line items)  
export const createCartCheckout = action({
  args: {
    sessionId: v.string(),
    userId: v.string(),
  },
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Please sign in to checkout.");
    }
    if (identity.subject !== args.userId) {
      throw new ConvexError("Session mismatch. Please sign in again.");
    }

    const cartItems: Array<{
      productId: string | number | Id<"products">;
      name: string;
      price: number;
      quantity: number;
      size?: string;
      color?: string;
      image: string;
    }> = await ctx.runQuery(api.cart.getCart, {
      sessionId: args.sessionId,
      userId: args.userId,
    });

    if (cartItems.length === 0) {
      throw new ConvexError("Your cart is empty.");
    }

    const subtotal = cartItems.reduce(
      (sum: number, item) => sum + item.price * item.quantity,
      0,
    );
    const shippingCost = subtotal > 200 ? 0 : 15;
    const total = subtotal + shippingCost;

    const orderId: Id<"orders"> = await ctx.runMutation(
      api.orders.createPendingOrderFromCart,
      {
        userId: args.userId,
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image,
        })),
        subtotal,
        shippingCost,
        total,
      },
    );

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email ?? undefined,
      name: identity.name ?? undefined,
    });

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new ConvexError("Payment is temporarily unavailable.");
    }

    const stripe = new Stripe(stripeSecretKey);

    const clientUrl = getClientUrl();

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
            metadata: {
              productId: String(item.productId),
              ...(item.size ? { size: item.size } : {}),
              ...(item.color ? { color: item.color } : {}),
            },
          },
        },
        quantity: item.quantity,
      }));

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          unit_amount: Math.round(shippingCost * 100),
          product_data: {
            name: "Shipping",
            description: "Standard delivery",
          },
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customer.customerId,
      line_items: lineItems,
      success_url: `${clientUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cart?checkout=cancelled`,
      shipping_address_collection: {
        allowed_countries: [...SHIPPING_COUNTRIES],
      },
      metadata: {
        orderId,
        sessionId: args.sessionId,
        userId: args.userId,
      },
      payment_intent_data: {
        metadata: {
          orderId,
          sessionId: args.sessionId,
          userId: args.userId,
        },
      },
    });

    if (!session.url) {
      throw new ConvexError("Could not start checkout. Please try again.");
    }

    await ctx.runMutation(api.orders.setStripeCheckoutSessionId, {
      orderId,
      stripeCheckoutSessionId: session.id,
    });

    return { url: session.url };
  },
});
