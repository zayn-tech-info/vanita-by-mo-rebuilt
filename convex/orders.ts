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

const cartItemValidator = v.object({
  productId: v.union(v.number(), v.string(), v.id("products")),
  name: v.string(),
  price: v.number(),
  quantity: v.number(),
  size: v.optional(v.string()),
  color: v.optional(v.string()),
  image: v.string(),
});

export const createPendingOrderFromCart = mutation({
  args: {
    userId: v.string(),
    items: v.array(cartItemValidator),
    subtotal: v.number(),
    shippingCost: v.number(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      userId: args.userId,
      customerName: "Pending",
      customerEmail: "pending@checkout",
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
    });
  },
});

export const setStripeCheckoutSessionId = mutation({
  args: {
    orderId: v.id("orders"),
    stripeCheckoutSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
    });
    return args.orderId;
  },
});

export const completeFromStripeCheckout = mutation({
  args: {
    orderId: v.id("orders"),
    stripeCheckoutSessionId: v.string(),
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
    const order = await ctx.db.get(args.orderId);
    if (!order || order.status !== "awaiting_payment") {
      return null;
    }
    await ctx.db.patch(args.orderId, {
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      shippingAddress: args.shippingAddress,
      status: "pending",
    });
    return args.orderId;
  },
});

export const getByStripeCheckoutSessionId = query({
  args: { stripeCheckoutSessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_stripe_checkout_session", (q) =>
        q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId),
      )
      .first();
  },
});

// Place a new order (manual / legacy)
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
      }),
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

export const setConfirmationEmailSent = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      confirmationEmailSentAt: Date.now(),
    });
    return args.orderId;
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").collect();
    return orders.filter((order) => order.userId === args.userId);
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("awaiting_payment"),
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").order("desc").collect();
    return orders.filter((order) => order.status === args.status);
  },
});

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
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.orderId, { status: args.status });

    const existing = await ctx.db
      .query("orderStatusNotificationQueue")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    const jobId = await ctx.scheduler.runAfter(
      ORDER_STATUS_EMAIL_DELAY_MS,
      api.email.sendOrderStatusNotification,
      { orderId: args.orderId },
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
