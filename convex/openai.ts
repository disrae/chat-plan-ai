import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { OpenAI } from "openai";

const openai = new OpenAI();

export const generateSummary = action({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, { conversationId }): Promise<string> => {
        // Get the current user
        const userId = await ctx.auth.getUserIdentity();
        if (!userId) { throw new Error("Not authenticated"); }

        // Get the current conversation
        const conversation = await ctx.runQuery(api.conversations.getConversationById, { conversationId });
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Check if the user is the owner of the conversation
        const isOwner = await ctx.runQuery(api.conversations.isOwner, { conversationId });
        if (!isOwner) {
            throw new Error("User is not the owner of this conversation");
        }

        // Get the messages from the conversation
        const messages = await ctx.runQuery(api.messages.list, { conversationId });
        if (!messages || messages.length === 0) {
            throw new Error("No messages found for this conversation");
        }

        // Initialize OpenAI
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("Add your OPENAI_API_KEY as an env variable");
        }
        console.log(JSON.stringify({ sendingMessages: messages }, null, 2));

        // Send messages to GPT-4
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant that summarizes conversations. Your output should be in HTML format, it should be very terse, containing basically sections and subsections with bullet points, or as you see fit." },
                { role: "user", content: `Summarize the following conversation:\n\n${messages.map(m => `${m.name}: ${m.body}`).join('\n')}` }
            ],
        });

        const summaryContent = response.choices[0].message?.content ?? undefined;

        if (!summaryContent) {
            throw new Error("Failed to generate summary");
        }

        await ctx.runMutation(internal.messages.storeSummary, { conversationId, summary: summaryContent });

        return summaryContent;
    },
});
