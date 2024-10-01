import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, { conversationId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) { return null; }
        const user = await ctx.db.get(userId);
        if (!user) { return null; }
        // Get the conversation.
        const conversation = await ctx.db.get(conversationId);
        if (!conversation) { return null; }

        // Check if the user is a participant in the conversation.
        if (!conversation.participants.includes(userId)) {
            console.error(
                "User is not a participant in the conversation.",
                { userId, conversationId });
            return null;
        }
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
            .collect();
        return messages;
    },
});

export const send = mutation({
    args: {
        name: v.string(),
        body: v.string(),
        conversationId: v.id("conversations")
    },
    handler: async (ctx, { body, conversationId, name }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) { return null; }

        const user = await ctx.db.get(userId);
        if (!user) { return null; }

        const conversation = await ctx.db.get(conversationId);
        if (!conversation) { return null; }

        if (!conversation.participants.includes(userId)) {
            console.error(
                "User is not a participant in the conversation.",
                { userId, conversationId });
            return null;
        }

        return await ctx.db.insert("messages", {
            author: userId,
            name,
            body,
            conversationId,
        });
    },
});

// export const addMessage = mutation({
//     args: {
//         author: v.string(),
//         role: v.union(v.literal("user"), v.literal('owner')),
//         body: v.string(),
//         conversationId: v.id("conversations"),
//     },
//     handler: async (ctx, { author, role, body, conversationId }) => {
//         await ctx.db.insert("messages", {
//             author,
//             role,
//             body,
//             conversationId,
//         });
//     },
// });

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