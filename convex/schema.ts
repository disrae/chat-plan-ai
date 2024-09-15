import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    ...authTables,
    messages: defineTable({
        author: v.string(),
        role: v.union(v.literal("user"), v.literal('owner')),
        body: v.string(),
        conversationId: v.id("conversations"),
    }).index("by_conversationId", ["conversationId"]),
    conversations: defineTable({
        name: v.string(),
        owner: v.string(),
        participants: v.array(v.string()),
    }).index("by_owner", ["owner"])
        .index("by_name", ["name"]),
    summaries: defineTable({
        conversationId: v.id('conversations'),
        sections: v.array(v.object({
            title: v.string(),
            bullets: v.array(v.string()),
        })),
        dateGenerated: v.number(),
    })
});