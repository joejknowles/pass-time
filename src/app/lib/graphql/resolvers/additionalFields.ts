import { BalanceTarget, Task, TaskInstance } from "@prisma/client";
import { calculateProgress, Context } from "./helpers/helpers";
import { GraphQLError } from "graphql";

export const additionalFields = {
    Task: {
        defaultDuration: (parent: Task) => {
            return parent.defaultDuration || 30;
        },
        isSuggestingEnabled: (parent: Task) => {
            return parent.isSuggestingEnabled ?? false;
        },
        progress: async (parent: BalanceTarget, _args: any, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('User not authenticated', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            const allTime = Math.round(await calculateProgress(parent.id, 'ALL_TIME', context.user.id));
            const today = Math.round(await calculateProgress(parent.id, 'DAILY', context.user.id));
            const thisWeek = Math.round(await calculateProgress(parent.id, 'WEEKLY', context.user.id));
            return { today, thisWeek, allTime };
        },
    },
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
            return Math.round(await calculateProgress(parent.taskId, parent.timeWindow, context.user.id));
        },
    },
}