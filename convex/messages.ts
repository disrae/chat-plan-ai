import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addMessage = mutation({
    args: {
        author: v.string(),
        role: v.union(v.literal("user"), v.literal('owner')),
        body: v.string(),
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, { author, role, body, conversationId }) => {
        await ctx.db.insert("messages", {
            author,
            role,
            body,
            conversationId,
        });
    },
});

export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, { messageId }) => {
        // Delete the message from the messages table
        await ctx.db.delete(messageId);
    },
});

// Mutation to update a message's body
export const updateMessage = mutation({
    args: {
        messageId: v.id("messages"),
        newBody: v.string(),
    },
    handler: async (ctx, { messageId, newBody }) => {
        // Update the message body
        await ctx.db.patch(messageId, { body: newBody });
    },
});

export const getConversationMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, { conversationId }) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
            .collect();
        console.log({ messages });
        return messages;
    },
});