import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateSecret(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export const exists = query({
    args: { name: v.string() },
    handler: async (ctx, { name }) => {
        const conversations = await ctx.db.query('conversations').withIndex('by_name', q => (q.eq("name", name))).collect();
        console.log('the number of conversations is', conversations.length);
        return conversations.length > 0;
    }
});

export const getConversationById = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, { conversationId }) => {
        const conversation = await ctx.db.get(conversationId);
        if (!conversation) { throw new Error("Conversation not found"); }
        return conversation;
    },
});

export const getIdFromName = query({
    args: { name: v.string() },
    handler: async (ctx, { name }) => {
        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_name", (q) => q.eq("name", name))
            .unique();

        if (!conversation) { throw new Error("Conversation not found"); }
        return conversation._id;
    },
});

export const addConversation = mutation({
    args: {
        name: v.string(), projectId: v.id("projects")
    },
    handler: async (ctx, { name, projectId }) => {

        const userId = await getAuthUserId(ctx);
        if (!userId) { throw new Error("Unauthorized, no user identity found"); }

        const user = await ctx.db.get(userId);
        if (!user) { throw new Error("User not found"); }

        const newConversation = await ctx.db.insert('conversations', {
            name,
            owner: userId,
            participants: [userId],
            secret: generateSecret(12)
        });
        await ctx.db.patch(userId, { conversationIds: [...user.conversationIds, newConversation] });
        const project = await ctx.db.get(projectId);
        if (!project) { throw new Error("Project not found"); }
        await ctx.db.patch(projectId, { conversations: [...project.conversations, newConversation] });
        return newConversation;
    }
});

export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, { conversationId }) => {
        const messages = await ctx.db.query('messages')
            .withIndex('by_conversationId',
                q => (q.eq("conversationId", conversationId))).collect();
        return messages;
    }
});

export const getConversationBySecret = query({
    args: { secret: v.string() },
    handler: async (ctx, { secret }) => {
        const conversation = await ctx.db.query('conversations').withIndex('by_secret', q => (q.eq("secret", secret))).unique();
        console.log(JSON.stringify({ conversation }, null, 2));
        if (!conversation) { throw new Error("Conversation not found"); }
        return conversation;
    },
});