import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    ...authTables,
    users: defineTable({
        email: v.string(),
        name: v.string(),
        image: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
        accountType: v.union(v.literal("personal"), v.literal("business")),
        businesses: v.union(v.array(v.id("businesses")), v.null()),
        businessName: v.union(v.string(), v.null()),
        conversationIds: v.array(v.id("conversations")),
        pushTokens: v.array(v.string()),
    }).index("email", ["email"]),
    businesses: defineTable({
        ownerId: v.id("users"),
        name: v.string(),
        projects: v.array(v.id("projects")),
    })
        .index("by_ownerId", ["ownerId"])
        .index("by_name", ["name"]),
    projects: defineTable({
        owner: v.id("users"),
        businessId: v.id("businesses"),
        name: v.string(),
        conversations: v.array(v.id("conversations")),
    })
        .index("by_businessId", ["businessId"])
        .index("by_owner", ["owner"]),
    conversations: defineTable({
        name: v.string(),
        owner: v.id("users"),
        ownerName: v.string(),
        business: v.id("businesses"),
        businessName: v.string(),
        project: v.id("projects"),
        projectName: v.string(),
        participants: v.array(v.id("users")),
        secret: v.string(),
    })
        .index("by_participant", ["participants"])
        .index("by_name", ["name"])
        .index("by_secret", ["secret"])
        .index("by_businessName", ["businessName"]),
    messages: defineTable({
        conversationId: v.id("conversations"),
        author: v.string(),
        name: v.string(),
        body: v.string(),
    }).index("by_conversationId", ["conversationId"]),
    summaries: defineTable({
        conversationId: v.id("conversations"),
        sections: v.array(v.object({
            title: v.string(),
            bullets: v.array(v.string()),
        })),
        dateGenerated: v.number(),
    }),
});
