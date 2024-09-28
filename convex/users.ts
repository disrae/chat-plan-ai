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

        // Fetch businesses and their projects
        const businesses = await Promise.all(
            user.businesses.map(async (businessId) => {
                const business = await ctx.db.get(businessId);
                if (!business) {
                    return null;
                }

                // Fetch projects for each business
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
