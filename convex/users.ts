import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { clerkUserIdFromIdentity } from "./clerkIdentity";

 
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = clerkUserIdFromIdentity(identity);
    if (!clerkId) return null;
    const user = await ctx.db
      .query("user")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    return user;
  },
});

/**
 * Get user by ID (for admin operations)
 */
export const getById = query({
  args: { userId: v.id("user") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * List all users (admin only - checked on frontend)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("user").collect();
  },
});

/**
 * Update a user's role (admin only)
 */
export const updateRole = mutation({
  args: {
    userId: v.id("user"),
    role: v.union(v.literal("admin"), v.literal("customer")),
  },
  handler: async (ctx, args) => {
    // Check admin access
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = clerkUserIdFromIdentity(identity);
    if (!clerkId) {
      throw new Error("Unauthorized");
    }
    const admin = await ctx.db
      .query("user")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return args.userId;
  },
});
