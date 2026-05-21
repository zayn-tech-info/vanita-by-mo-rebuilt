import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a presigned upload URL for the client
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

// Get the serving URL for a stored file by its storage ID
export const getImageUrl = mutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});
