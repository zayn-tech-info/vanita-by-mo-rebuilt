import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { clerkUserIdFromIdentity } from "./clerkIdentity";

async function requireAdmin(ctx: { auth: any; db: any }) {
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

/** List all redeem codes (admin). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("redeemCodes").order("desc").collect();
  },
});

/** Validate a redeem code and return discount info. Does not mutate. */
export const validate = query({
  args: {
    code: v.string(),
    subtotal: v.number(),
  },
  handler: async (ctx, args) => {
    const normalized = args.code.trim().toUpperCase();
    if (!normalized) {
      return { valid: false, message: "Please enter a code." };
    }

    const rows = await ctx.db
      .query("redeemCodes")
      .withIndex("by_code", (q) => q.eq("code", normalized))
      .collect();

    const row = rows[0];
    if (!row) {
      return { valid: false, message: "Invalid or expired code." };
    }

    if (Date.now() > row.expiresAt) {
      return { valid: false, message: "This code has expired." };
    }

    if (row.usedCount >= row.maxUses) {
      return { valid: false, message: "This code has reached its usage limit." };
    }

    const minPurchase = row.minPurchase ?? 0;
    if (args.subtotal < minPurchase) {
      return {
        valid: false,
        message: `Minimum order of $${minPurchase.toFixed(2)} required for this code.`,
      };
    }

    let discountAmount: number;
    if (row.type === "percent") {
      discountAmount = Math.min(
        (args.subtotal * row.value) / 100,
        args.subtotal
      );
    } else {
      discountAmount = Math.min(row.value, args.subtotal);
    }

    return {
      valid: true,
      message: "Code applied.",
      discountAmount: Math.round(discountAmount * 100) / 100,
      type: row.type,
      value: row.value,
    };
  },
});

/** Record that a code was used (call when order is completed). */
export const recordUsage = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.code.trim().toUpperCase();
    const rows = await ctx.db
      .query("redeemCodes")
      .withIndex("by_code", (q) => q.eq("code", normalized))
      .collect();
    const row = rows[0];
    if (row && row.usedCount < row.maxUses) {
      await ctx.db.patch(row._id, { usedCount: row.usedCount + 1 });
    }
  },
});

/** Create a redeem code (admin only). If the same code already exists but is expired, it is renewed with the new settings. */
export const create = mutation({
  args: {
    userId: v.string(),
    code: v.string(),
    type: v.union(v.literal("percent"), v.literal("fixed")),
    value: v.number(),
    expiresAt: v.number(),
    maxUses: v.number(),
    minPurchase: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const normalized = args.code.trim().toUpperCase();
    const existing = await ctx.db
      .query("redeemCodes")
      .withIndex("by_code", (q) => q.eq("code", normalized))
      .first();

    if (existing) {
      const isExpired = Date.now() > existing.expiresAt;
      if (!isExpired) {
        throw new ConvexError(
          "A code with this value already exists and is still active. Use a different code or wait until it expires."
        );
      }
      // Renew expired code with new settings
      await ctx.db.patch(existing._id, {
        type: args.type,
        value: args.value,
        expiresAt: args.expiresAt,
        maxUses: args.maxUses,
        usedCount: 0,
        minPurchase: args.minPurchase,
      });
      return existing._id;
    }

    return await ctx.db.insert("redeemCodes", {
      code: normalized,
      type: args.type,
      value: args.value,
      expiresAt: args.expiresAt,
      maxUses: args.maxUses,
      usedCount: 0,
      minPurchase: args.minPurchase,
    });
  },
});
