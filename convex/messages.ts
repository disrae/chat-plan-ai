import { getAuthUserId } from "@convex-dev/auth/server";
import { internalAction, action, internalMutation, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { } from "openai";

export const list = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, { conversationId }) => {
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

        const participantUsers = await Promise.all(
            conversation.participants.map(participantId => ctx.db.get(participantId))
        );
        console.log({ participantUsers });
        const pushTokens = participantUsers
            .filter(user => user?._id !== userId) // Exclude the author
            .flatMap(user => user?.pushTokens || []);
        const uniquePushTokens = [...new Set(pushTokens)].filter(Boolean);
        console.log("Push tokens for conversation participants (excluding author):", uniquePushTokens);

        const messageId = await ctx.db.insert("messages", {
            author: userId,
            name,
            body,
            conversationId,
        });

        for (const token of uniquePushTokens) {
            await ctx.scheduler.runAfter(0, internal.messages.sendPushNotification, {
                token,
                title: name,
                message: body,
                conversationId,
                businessName: conversation.businessName,
                projectName: conversation.projectName,
            });
        }

        return messageId;
    },
});

export const sendPushNotification = internalAction({
    args: {
        token: v.string(),
        title: v.string(),
        message: v.string(),
        conversationId: v.id("conversations"),
        businessName: v.optional(v.string()),
        projectName: v.optional(v.string()),
    },
    handler: async (ctx, { message, token, title, conversationId, businessName, projectName }) => {
        try {
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: token,
                    title,
                    body: message,
                    data: { conversationId, businessName, projectName },
                }),
            });

            if (!response.ok) {
                console.error(`Failed to send notification: ${await response.text()}`);
            }
        } catch (error) {
            console.error(`Error sending notification:`, error);
        }
    },
});

export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, { messageId }) => {
        await ctx.db.delete(messageId);
    },
});

export const updateMessage = mutation({
    args: {
        messageId: v.id("messages"),
        newBody: v.string(),
    },
    handler: async (ctx, { messageId, newBody }) => {
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
        return messages;
    },
});

export const storeSummary = internalMutation({
    args: { conversationId: v.id("conversations"), summary: v.string() },
    handler: async (ctx, { conversationId, summary }) => {
        await ctx.db.insert("summaries", {
            conversationId,
            html: summary,
        });
    },
});

