import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { clerkUserIdFromIdentity } from "./clerkIdentity";


async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
    const clerkId = clerkUserIdFromIdentity(identity);
    if (!clerkId) {
        throw new Error("Unauthorized: Admin access required.");
    }
    const user = await ctx.db
        .query("user")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", clerkId))
        .unique();
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required.");
      }
      return user;
    }


//  CUSTOMER MUTATIONS

// Create a pending order before redirecting to Stripe (used by payments action)
export const createPendingOrder = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.string(),
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
    appliedRedeemCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      userId: args.userId,
      customerName: "Pending",
      customerEmail: "pending@stripe",
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      items: args.items,
      subtotal: args.subtotal,
      shippingCost: args.shippingCost,
      total: args.total,
      status: "awaiting_payment",
      appliedRedeemCode: args.appliedRedeemCode,
    });
  },
});

// Create pending order with shipping (for embedded Payment Element flow)
export const createPendingOrderWithShipping = mutation({
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
    appliedRedeemCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      userId: args.userId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      shippingAddress: args.shippingAddress,
      items: args.items,
      subtotal: args.subtotal,
      shippingCost: args.shippingCost,
      total: args.total,
      status: "awaiting_payment",
      appliedRedeemCode: args.appliedRedeemCode,
    });
  },
});

// Store Stripe PaymentIntent ID on order (for embedded flow lookup)
export const setPaymentIntentId = mutation({
  args: {
    orderId: v.id("orders"),
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { paymentIntentId: args.paymentIntentId });
    return args.orderId;
  },
});

// Mark order as paid after PaymentIntent succeeds (called from webhook)
export const completeOrderFromPaymentIntent = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { status: "pending" });
    return args.orderId;
  },
});

// Complete order after Stripe Checkout redirect (called from webhook when Stripe collected shipping)
export const completeFromStripe = mutation({
  args: {
    orderId: v.id("orders"),
    stripeSessionId: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      stripeSessionId: args.stripeSessionId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      shippingAddress: args.shippingAddress,
      status: "pending",
    });
    return args.orderId;
  },
});

// When shipping was collected on our site, Stripe only collected payment — just mark order paid
export const completeFromStripeCheckoutOnly = mutation({
  args: {
    orderId: v.id("orders"),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      stripeSessionId: args.stripeSessionId,
      status: "pending",
    });
    return args.orderId;
  },
});

export const setConfirmationEmailSent = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      confirmationEmailSentAt: Date.now(),
    });
    return args.orderId;
  },
});

// Place a new order (legacy — kept for backward compatibility; prefer Stripe flow)
export const place = mutation({
    args: {
        userId: v.optional(v.string()),
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
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("orders", {
            ...args,
            status: "pending",
        });
    },
});


//  CUSTOMER QUERIES

// Get orders for a specific user
export const listByUser = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const orders = await ctx.db.query("orders").collect();
        return orders.filter((order) => order.userId === args.userId);
    },
});

// Get a single order by ID
export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get order by Stripe Checkout session ID (for confirmation page after redirect)
export const getByStripeSessionId = query({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").collect();
    return orders.find((o) => o.stripeSessionId === args.stripeSessionId) ?? null;
  },
});

// Get order by Stripe PaymentIntent ID (for embedded payment confirmation)
export const getByPaymentIntentId = query({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").collect();
    return orders.find((o) => o.paymentIntentId === args.paymentIntentId) ?? null;
  },
});


//  ADMIN QUERIES

// (admin only - checked on frontend)
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("orders").order("desc").collect();
    },
});

// Get orders filtered by status
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("awaiting_payment"),
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").order("desc").collect();
    return orders.filter((order) => order.status === args.status);
  },
});


//  ADMIN MUTATIONS

// Update order status (admin only). Schedules a delayed order-status email (e.g. 3 min) to avoid spam when admin corrects status multiple times.
const ORDER_STATUS_EMAIL_DELAY_MS = 3 * 60 * 1000;

export const updateStatus = mutation({
  args: {
    userId: v.string(),
    orderId: v.id("orders"),
    status: v.union(
      v.literal("awaiting_payment"),
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.orderId, { status: args.status });

    const existing = await ctx.db
      .query("orderStatusNotificationQueue")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (existing) {
      // Stored scheduledJobId is a string; cancelling requires the original job Id object.
      // Skipping cancel here to avoid type/runtime issues; the scheduled job will either run or be ignored.
    }

    const jobId = await ctx.scheduler.runAfter(
      ORDER_STATUS_EMAIL_DELAY_MS,
      api.email.sendOrderStatusNotification,
      { orderId: args.orderId }
    );

    if (existing) {
      await ctx.db.patch(existing._id, { scheduledJobId: String(jobId) });
    } else {
      await ctx.db.insert("orderStatusNotificationQueue", {
        orderId: args.orderId,
        scheduledJobId: String(jobId),
      });
    }

    return args.orderId;
  },
});

/** Clear the pending status notification for an order (called by email action after sending). */
export const clearOrderStatusNotification = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("orderStatusNotificationQueue")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();
    if (row) await ctx.db.delete(row._id);
  },
});
