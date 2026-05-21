import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
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


//  PUBLIC QUERIES (for storefront)
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("products").collect();
    },
});

// Get products filtered by category
export const listByCategory = query({
    args: { category: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("products")
            .withIndex("by_category", (q) => q.eq("category", args.category))
            .collect();
    },
});

// Get a single product by ID
export const getById = query({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});


// Create a new product (admin only)
export const create = mutation({
    args: {
        userId: v.string(),
        name: v.string(),
        price: v.number(),
        category: v.string(),
        image: v.string(),
        isNew: v.boolean(),
        isBestseller: v.boolean(),
        sizes: v.array(v.string()),
        colors: v.array(v.string()),
        description: v.optional(v.string()),
        material: v.optional(v.string()),
        care: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const { userId, ...productData } = args;
        return await ctx.db.insert("products", productData);
    },
});

// Update an existing product (admin only)
export const update = mutation({
    args: {
        userId: v.string(),
        id: v.id("products"),
        name: v.optional(v.string()),
        price: v.optional(v.number()),
        category: v.optional(v.string()),
        image: v.optional(v.string()),
        isNew: v.optional(v.boolean()),
        isBestseller: v.optional(v.boolean()),
        sizes: v.optional(v.array(v.string())),
        colors: v.optional(v.array(v.string())),
        description: v.optional(v.string()),
        material: v.optional(v.string()),
        care: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const { userId, id, ...updates } = args;

        // Filter out undefined values
        const cleanUpdates: Record<string, any> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                cleanUpdates[key] = value;
            }
        }

        await ctx.db.patch(id, cleanUpdates);
        return id;
    },
});

// Delete a product (admin only)
export const remove = mutation({
    args: {
        userId: v.string(),
        id: v.id("products"),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.delete(args.id);
    },
});
