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
        if (!userId) { return null; }
        const user = await ctx.db.get(userId);
        if (!user) { return null; }

        if (user.accountType === "personal") {
            const conversations = await getAll(ctx.db, user?.conversationIds);
            return { user, conversations };
        }

        if (!user.businesses) { return null; }
        const businesses = await getAll(ctx.db, user.businesses);
        return { user, businesses };
    },
});
