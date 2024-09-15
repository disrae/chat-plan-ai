import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const exists = query({
    args: { name: v.string() },
    handler: async (ctx, { name }) => {
        const conversations = await ctx.db.query('conversations').withIndex('by_name', q => (q.eq("name", name))).collect();
        console.log('the number of conversations is', conversations.length);
        return conversations.length > 0;
    }
});

export const getIdFromName = query({
    args: { name: v.string() },
    handler: async (ctx, { name }) => {
        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_name", (q) => q.eq("name", name))
            .unique();

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Return the conversation ID
        return conversation._id;
    },
});

export const createConversation = mutation({
    args: { name: v.string(), owner: v.string(), participants: v.array(v.string()) },
    handler: async (ctx, { name, owner }) => {
        const newConversation = await ctx.db.insert('conversations', { name, owner, participants: [owner] });
        return newConversation;
    }
});

export const loadConversation = query({
    args: { conversationName: v.string() },
    handler: async (ctx, { conversationName }) => {
        // Get the conversationId from the name from the conversations table.
        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_name", (q) => q.eq("name", conversationName))
            .unique();

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        const conversationId = conversation._id;

        // Fetch messages for the conversationId from the messages table.
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
            .collect();
        console.log({ messages });
        return messages;
    },
});