import { BalanceTarget, TaskInstance } from "@prisma/client";
import { calculateProgress, Context } from "./helpers/helpers";
import { GraphQLError } from "graphql";

export const additionalFields = {
    TaskInstance: {
        start: (parent: TaskInstance) => {
            const startTime = new Date(parent.startTime);
            return {
                date: startTime.toISOString().split('T')[0],
                hour: startTime.getUTCHours(),
                minute: startTime.getUTCMinutes(),
            };
        },
    },
    BalanceTarget: {
        progress: async (parent: BalanceTarget, _args: any, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('User not authenticated', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }
            return Math.round(await calculateProgress(parent.taskId, parent));
        },
    },
}