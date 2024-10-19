import { convexAuth } from "@convex-dev/auth/server";
import Password from "./CustomPassword";

import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
  callbacks: {
    createOrUpdateUser: async (ctx, args) => {
      if (args.existingUserId) {
        // Optionally merge updated fields into the existing user object here
        return args.existingUserId;
      }

      const user = await ctx.db.query("users").filter(q => q.eq(q.field("email"), args.profile.email)).first();
      console.log(JSON.stringify({ user }, null, 2));
      if (user) return user._id;

      const userId = await ctx.db.insert("users", {
        email: args.profile.email as string,
        name: args.profile.name as string,
        accountType: args.profile.accountType as 'personal' | 'business',
        businesses: args.profile.accountType === 'business' ? [] : null,
        businessName: args.profile.accountType === 'business' ? args.profile.businessName as string : null,
        conversationIds: [],
        pushTokens: []
      });

      if (args.profile.accountType === 'business') {
        const businessId = await ctx.db.insert("businesses", {
          ownerId: userId,
          name: args.profile.businessName as string,
          projects: []
        });
        await ctx.db.patch(userId, { businesses: [businessId] });
      }

      return userId;
    },
  },
});
