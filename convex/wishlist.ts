import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/** List wishlist items for a user (with product details). */
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const withProduct = [];
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        withProduct.push({
          _id: item._id,
          productId: item.productId,
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
          },
        });
      } else {
        // Product no longer exists; skip removing here (queries must not write).
      }
    }
    return withProduct;
  },
});

/** Add a product to the wishlist (one per product per user). */
export const add = mutation({
  args: {
    userId: v.string(),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as string))
      .collect();
    if (existing.some((e) => e.productId === args.productId)) {
      return existing.find((e) => e.productId === args.productId)!._id;
    }
    return await ctx.db.insert("wishlist", {
      userId: args.userId,
      productId: args.productId,
    });
  },
});

/** Remove a product from the wishlist. */
export const remove = mutation({
  args: {
    userId: v.string(),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as string))
      .collect();
    const item = items.find((i) => i.productId === args.productId);
    if (item) await ctx.db.delete(item._id);
  },
});

/** Remove by wishlist row id. */
export const removeById = mutation({
  args: {
    userId: v.string(),
    wishlistId: v.id("wishlist"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.wishlistId);
    if (item && item.userId === args.userId) {
      await ctx.db.delete(args.wishlistId);
    }
  },
});

/** Check if a product is in the user's wishlist. */
export const isInWishlist = query({
  args: {
    userId: v.optional(v.string()),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;
    const uid = args.userId as string;
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .collect();
    return items.some((i) => i.productId === args.productId);
  },
});
