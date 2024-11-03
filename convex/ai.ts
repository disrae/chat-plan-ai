import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { OpenAI } from "openai";

const providers = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o",
        baseURL: "https://api.openai.com/v1",
    },
    xai: {
        apiKey: process.env.XAI_API_KEY,
        model: "grok-beta",
        baseURL: "https://api.x.ai/v1",
    }
};

const provider = providers.openai;
const client = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
});

export const generateSummary = action({
    args: { conversationId: v.id("conversations"), customerPrompt: v.string() },
    handler: async (ctx, { conversationId, customerPrompt }): Promise<string> => {
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

        // Get the owner info
        const owner = await ctx.runQuery(api.users.getById, { userId: conversation.owner });
        if (!owner) {
            throw new Error("Owner not found");
        }

        const response = await client.chat.completions.create({
            model: provider.model,
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant for a project planning tool. \
                    You will receive a conversation between a business owner and their customer(s). \
                    You may receive an additional prompt from the business owner to guide your output. \
                    The ouput needs to be plain HTML, absolutely no markdown, it will be rendered in quillJS where the business owner can edit your output. \
                    This app is for business owners to help them plan projects with customers, \
                    so, your output should outline the project plan or follow the prompt of the business owner. \
                    I recommend you to be terse, you can use nested lists, but think about what the business owner needs to write down about the project. \
                    This output can serve as a project plan, which they share with their customer, so make the output read well for both the business owner and the customer. \
                    Organize the chat as you see fit, try to be terse, you can use nested lists, or not, as you see fit. \
                    You may receive a custom prompt from ${owner.name}, the business owner, to guide your output.`
                },
                {
                    role: "user",
                    content: `The business owner (${owner.name}) provided the following prompt: ${customerPrompt}\n\n\
                    Now summarize the following conversation:\n\n${messages.map(m => `${m.name}: ${m.body}`).join('\n')}`
                }
            ],
        });

        const summaryContent = response.choices[0].message?.content ?? undefined;

        if (!summaryContent) {
            throw new Error("Failed to generate summary");
        }

        console.log(JSON.stringify({ summaryContent }, null, 2));

        await ctx.runMutation(internal.messages.storeSummary, { conversationId, summary: summaryContent });

        return summaryContent;
    },
});
