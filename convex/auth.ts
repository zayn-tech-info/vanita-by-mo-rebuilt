import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const checkUserExists = mutation({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("user")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    return !!user;
  },
});

export const insertUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const newUser = await ctx.db.insert("user", {
      clerkId: "",
      name: args.name,
      email: args.email,
      password: args.password,
      role: "customer",
    });
    return newUser;
  },
});

export const getUserByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("user")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    return user;
  },
});

export const syncUserFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const byClerkId = await ctx.db
      .query("user")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkUserId))
      .unique();

    if (byClerkId) {
      await ctx.db.patch(byClerkId._id, {
        email: args.email,
        name: args.name,
      });
      return byClerkId._id;
    }

    // Link existing row by email (e.g. admin set in dashboard before clerkId matched)
    const byEmail = await ctx.db
      .query("user")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (byEmail) {
      await ctx.db.patch(byEmail._id, {
        clerkId: args.clerkUserId,
        email: args.email,
        name: args.name,
      });
      return byEmail._id;
    }

    return await ctx.db.insert("user", {
      clerkId: args.clerkUserId,
      email: args.email,
      name: args.name,
      password: undefined,
      role: "customer",
    });
  },
});

export const deleteByClerkId = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("user")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkUserId))
      .unique();
    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
