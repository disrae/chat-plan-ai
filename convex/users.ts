import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { query } from "./_generated/server";
import { auth } from "./auth";
import { getAuthUserId, } from '@convex-dev/auth/server';

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        return userId !== null ? ctx.db.get(userId) : null;
    },
});

// Mutation to create a new user and their business (if applicable)
export const createUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        accountType: v.union(v.literal("personal"), v.literal("business")),
        businessName: v.optional(v.string()),
    },
    handler: async (ctx, { clerkId, name, email, accountType, businessName }) => {
        // Step 1: Insert the user without a business first
        const userId = await ctx.db.insert("users", {
            clerkId,
            email,
            name,
            accountType,
            businesses: null,
            conversationIds: accountType === 'personal' ? [] : null,
        });

        // Step 2: If account type is 'business', create a business entry using the userId
        if (accountType === 'business' && businessName) {
            const businessId = await ctx.db.insert("businesses", {
                ownerId: userId,  // Now we have the userId to link the business
                name: businessName,
                projects: [],
            });

            // Step 3: Update the user to link the created business
            await ctx.db.patch(userId, {
                businesses: [businessId], // Update the user's businesses field with the new business ID
            });
        }
    },
});
