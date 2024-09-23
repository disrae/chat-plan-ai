import { convexAuth } from "@convex-dev/auth/server";
// import { Password } from "@convex-dev/auth/providers/Password";
import Password from "./CustomPassword";
import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
  callbacks: {
    // `args` are the same the as for `createOrUpdateUser` but include `userId`
    async afterUserCreatedOrUpdated(ctx: MutationCtx, { userId, profile }) {
      console.log({ profile });
      const { businessName } = profile;
      // Insert a new business with the owner id set to the new user
      const businessId = await ctx.db.insert("businesses", { ownerId: userId, name: businessName as string, projects: [] });

      // Patch the user with the businessId
      await ctx.db.patch(userId, { businesses: [businessId] });
    },
  }
});
