import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";
import { z } from "zod";
import { ConvexError } from "convex/values";
import { ResendOTP } from "./ResendOTP";

const ParamsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(2),
});

export default Password<DataModel>({
    profile(params) {
        const { error, data } = ParamsSchema.safeParse(params);
        if (error) { throw new ConvexError(error.format()); }

        return {
            email: params.email as string,
            name: params.name as string,
            accountType: params.accountType as 'personal' | 'business',
            businesses: params.accountType === 'business' ? [] : null,
            businessName: params.accountType === 'business' ? params.businessName as string : null,
            conversationIds: [],
        };
    },
    verify: ResendOTP
});
