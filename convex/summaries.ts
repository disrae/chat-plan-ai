import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const getSummary = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, { conversationId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized, no user identity found");
        }

        const conversation = await ctx.db.get(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
            throw new Error("User is not a participant in this conversation");
        }

        const summary = await ctx.db
            .query("summaries")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
            .order("desc")
            .first();

        return summary ? summary.html : "";
    },
});

export const addSummary = mutation({
    args: { conversationId: v.id("conversations"), html: v.string() },
    handler: async (ctx, { conversationId, html }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized, no user identity found");
        }

        const conversation = await ctx.db.get(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
            throw new Error("User is not a participant in this conversation");
        }

        const newSummary = await ctx.db.insert("summaries", {
            conversationId,
            html,
        });

        return newSummary;
    },
});

export const getLatestSummary = query({
    args: { conversationId: v.optional(v.id("conversations")) },
    handler: async (ctx, { conversationId }) => {
        if (!conversationId) {
            return null;
        }

        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized, no user identity found");
        }

        const conversation = await ctx.db.get(conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        if (!conversation.participants.includes(userId)) {
            throw new Error("User is not a participant in this conversation");
        }

        const latestSummary = await ctx.db
            .query("summaries")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
            .order("desc")
            .first();

        return latestSummary ? latestSummary.html : "";
    },
});

