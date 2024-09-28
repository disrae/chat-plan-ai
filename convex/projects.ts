import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


export const addProject = mutation({
    args: {
        businessId: v.id("businesses"),
        name: v.string(),
    },
    handler: async (ctx, { businessId, name }) => {
        const userId = await getAuthUserId(ctx);
        const business = await ctx.db.get(businessId);
        if (!userId) { throw new Error("Unauthorized, no user identity found"); }
        if (!business) { throw new Error("Business not found"); }
        const newProject = await ctx.db.insert("projects", {
            businessId,
            name,
            conversations: [],
            owner: userId,
        });
        ctx.db.patch(businessId, { projects: [...business.projects, newProject] });
        return newProject;
    },
});