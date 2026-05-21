import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCart = query({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("cart")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    }
    return await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const getCartCount = query({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const items = args.userId
      ? await ctx.db
          .query("cart")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect()
      : await ctx.db
          .query("cart")
          .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
          .collect();
    return items.reduce((total, item) => total + item.quantity, 0);
  },
});


export const addToCart = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
    productId: v.union(v.number(), v.string(), v.id("products")),
    name: v.string(),
    price: v.number(),
    image: v.string(),
    category: v.string(),
    quantity: v.number(),
    size: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingItems = args.userId
      ? await ctx.db
          .query("cart")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect()
      : await ctx.db
          .query("cart")
          .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
          .collect();

    const existing = existingItems.find(
      (item) =>
        item.productId === args.productId &&
        item.size === args.size &&
        item.color === args.color,
    );

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
      return existing._id;
    }

    return await ctx.db.insert("cart", {
      sessionId: args.sessionId,
      userId: args.userId,
      productId: args.productId,
      name: args.name,
      price: args.price,
      image: args.image,
      category: args.category,
      quantity: args.quantity,
      size: args.size,
      color: args.color,
    });
  },
});


export const updateQuantity = mutation({
  args: {
    id: v.id("cart"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      await ctx.db.delete(args.id);
      return null;
    }
    await ctx.db.patch(args.id, { quantity: args.quantity });
    return args.id;
  },
});


export const removeFromCart = mutation({
  args: { id: v.id("cart") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});


export const clearCart = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const items = args.userId
      ? await ctx.db
          .query("cart")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect()
      : await ctx.db
          .query("cart")
          .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
          .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});

/** Merge guest cart (by sessionId) into user cart (by userId) and clear guest items. Call after login. */
export const mergeGuestCartIntoUser = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const guestItems = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    const userItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const guest of guestItems) {
      const existing = userItems.find(
        (u) =>
          u.productId === guest.productId &&
          u.size === guest.size &&
          u.color === guest.color,
      );
      if (existing) {
        await ctx.db.patch(existing._id, {
          quantity: existing.quantity + guest.quantity,
        });
      } else {
        await ctx.db.insert("cart", {
          sessionId: args.sessionId,
          userId: args.userId,
          productId: guest.productId,
          name: guest.name,
          price: guest.price,
          image: guest.image,
          category: guest.category,
          quantity: guest.quantity,
          size: guest.size,
          color: guest.color,
        });
      }
      await ctx.db.delete(guest._id);
    }
  },
});
