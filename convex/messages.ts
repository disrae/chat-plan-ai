import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to add a message
export const addMessage = mutation({
    args: {
        author: v.string(),
        role: v.union(v.literal("user"), v.literal('owner')),
        body: v.string(),
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, { author, role, body, conversationId }) => {
        // Insert the message into the messages table
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