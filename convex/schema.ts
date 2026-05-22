import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cart: defineTable({
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
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),

  user: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    password: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("customer"))),
  })
    .index("by_email", ["email"])
    .index("by_clerkId", ["clerkId"]),

  products: defineTable({
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
  }).index("by_category", ["category"]),

  orders: defineTable({
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
    status: v.union(
      v.literal("awaiting_payment"),
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    confirmationEmailSentAt: v.optional(v.number()),
  }),

  wishlist: defineTable({
    userId: v.string(),
    productId: v.id("products"),
  }).index("by_user", ["userId"]),

  orderStatusNotificationQueue: defineTable({
    orderId: v.id("orders"),
    scheduledJobId: v.string(),
  }).index("by_order", ["orderId"]),
});
