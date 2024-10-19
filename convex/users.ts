import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { query } from "./_generated/server";
import {
    getAll,
    getOneFrom,
    getManyFrom,
    getManyVia,
} from "convex-helpers/server/relationships";
import { getAuthUserId, } from '@convex-dev/auth/server';

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        return userId !== null ? ctx.db.get(userId) : null;
    },
});

export const getUserDashboardData = query({
    args: {},
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return null;
        }

        const user = await ctx.db.get(userId);
        if (!user) {
            return null;
        }

        // Handle personal accounts
        if (user.accountType === "personal") {
            const conversations = await getAll(ctx.db, user.conversationIds);
            return { user, conversations };
        }

        if (!user.businesses) {
            return null;
        }

        const businesses = await Promise.all(
            user.businesses.map(async (businessId) => {
                const business = await ctx.db.get(businessId);
                if (!business) {
                    return null;
                }

                const projects = await Promise.all(
                    business.projects.map(async (projectId) => {
                        const project = await ctx.db.get(projectId);
                        if (!project) {
                            return null;
                        }

                        // Fetch conversations for each project
                        const conversations = await getAll(ctx.db, project.conversations);

                        return {
                            ...project,
                            conversations,
                        };
                    })
                );

                const validProjects = projects.filter(project => project !== null);

                return { ...business, projects: validProjects };
            })
        );

        const validBusinesses = businesses.filter(business => business !== null);

        return { user, businesses: validBusinesses };
    },
});

export const updateUser = mutation({
    args: {
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        businessName: v.optional(v.string()),
        pushToken: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) { throw new Error("User not authenticated"); }

        const user = await ctx.db.get(userId);
        if (!user) { throw new Error("User not found"); }

        try {
            const updateFields: Partial<typeof user> = {};
            if (args.name !== undefined) updateFields.name = args.name;
            if (args.email !== undefined) updateFields.email = args.email;
            if (args.businessName !== undefined) updateFields.businessName = args.businessName;

            if (args.pushToken !== undefined) {
                updateFields.pushTokens = [...new Set([...(user.pushTokens || []), args.pushToken])];
            }

            if (user.accountType === "business" && args.businessName) {
                const existingBusiness = await ctx.db
                    .query("businesses")
                    .filter(q => q.eq(q.field("name"), args.businessName))
                    .first();

                if (existingBusiness && existingBusiness._id !== user.businesses?.[0]) {
                    throw new Error("Business name is already taken");
                }

                const userConversations = await ctx.db
                    .query("conversations")
                    .filter(q => q.eq(q.field("owner"), userId))
                    .collect();

                for (const conversation of userConversations) {
                    await ctx.db.patch(conversation._id, {
                        ownerName: args.name || user.name,
                        businessName: args.businessName
                    });
                }

                if (user.businesses) {
                    for (const businessId of user.businesses) {
                        await ctx.db.patch(businessId, { name: args.businessName });
                    }
                }
            }

            await ctx.db.patch(userId, updateFields);

            return { success: true };
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Failed to update user");
        }
    },
});


