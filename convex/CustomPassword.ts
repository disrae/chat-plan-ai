import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel, Id } from "./_generated/dataModel";
import { z } from "zod";
import { ConvexError } from "convex/values";
import { ResendOTP } from "./ResendOTP";

const ParamsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export default Password<DataModel>({
    profile(params) {
        const { error, data } = ParamsSchema.safeParse(params);
        if (error) { throw new ConvexError(error.format()); }
        console.log(JSON.stringify({ paramsInProfile: params, data }, null, 2));
        return {
            email: data.email as string,
            name: params.name as string,
            accountType: params.accountType as 'personal' | 'business',
            businesses: params.businesses as Id<"businesses">[] | null,
            businessName: params.businessName as string | null,
            conversationIds: params.conversationIds as Id<"conversations">[],
        };
    },
    verify: ResendOTP
});
