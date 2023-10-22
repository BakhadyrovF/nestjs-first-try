import { Prisma } from "@prisma/client";


export type UserSessionWithTokens = Prisma.UserSessionGetPayload<{
    include: {
        token: true
    }
}>;