import { BalanceTarget, Task, TaskInstance } from "@prisma/client";
import { calculateProgress, Context } from "./helpers/helpers";
import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { getNestedChildTaskIds } from "./helpers/getNestedChildTasks";
import { progressOverTime } from "./helpers/progressOverTime";


function isFieldRequested(info: GraphQLResolveInfo, path: string[]): boolean {
    let current = parseResolveInfo(info);
    for (const field of path) {
        if (!current || !current.fieldsByTypeName) return false;
        const fields = Object.values(current.fieldsByTypeName).flat();
        current = fields.find((f: any) => f[field])[field];
    }
    return !!current;
}

export const additionalFields = {
    Task: {
        defaultDuration: (parent: Task) => {
            return parent.defaultDuration || 30;
        },
        isSuggestingEnabled: (parent: Task) => {
            return parent.isSuggestingEnabled ?? false;
        },
        stats: async (parent: BalanceTarget, _args: any, context: Context, info: GraphQLResolveInfo) => {
            if (!context.user) {
                throw new GraphQLError('User not authenticated', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }


            let totals
            if (isFieldRequested(info, ['totals'])) {
                const allTime = Math.round(await calculateProgress(parent.id, 'ALL_TIME', context.user.id));
                const today = Math.round(await calculateProgress(parent.id, 'DAILY', context.user.id));
                const thisWeek = Math.round(await calculateProgress(parent.id, 'WEEKLY', context.user.id));
                totals = { today, thisWeek, allTime };
            }

            let data
            if (isFieldRequested(info, ['data', 'daily'])) {
                const taskIds = await getNestedChildTaskIds(parent.id, context.user.id);
                const aWeekAgo = new Date();
                aWeekAgo.setDate(aWeekAgo.getDate() - 7);
                const dailyData = await progressOverTime(
                    [parent.id, ...taskIds],
                    context.user.id,
                    { from: aWeekAgo, to: new Date() },
                    'DAILY'
                );
                data = {
                    daily: dailyData,
                }
            }

            return {
                totals,
                data
            }
        },
    },
    TaskInstance: {
        start: (parent: TaskInstance) => {
            const startTime = new Date(parent.startTime);
            return {
                date: startTime.toLocaleDateString('en-CA'),
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