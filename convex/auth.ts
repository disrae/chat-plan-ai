import { convexAuth } from "@convex-dev/auth/server";
import Password from "./CustomPassword";
import { MutationCtx } from "./_generated/server";
import { ResendOTP } from "./ResendOTP";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx: MutationCtx, { userId, profile }) {
      const { businessName } = profile;
      console.log({ businessName });
      const businessId = await ctx.db.insert("businesses", { ownerId: userId, name: "businessName" as string, projects: [] });
      await ctx.db.patch(userId, { businesses: [businessId] });
    },
  }
});
