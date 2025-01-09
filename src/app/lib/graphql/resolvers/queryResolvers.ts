// gradually migrating to `throw new GraphQLError` instead of `throw new Error`
import { GraphQLError } from 'graphql';
import { Context, prisma } from './helpers/helpers';
import { getChildTaskPaths } from './helpers/getChildTaskPaths';
import { calculateProgressForTasks } from './helpers/calculateProgressForTasks';

export const queryResolvers = {
    tasks: async (_parent: any, _args: any, context: Context) => {
        if (!context.user) {
            throw new GraphQLError('User not authenticated', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                },
            });
        }

        return await prisma.task.findMany({
            where: { userId: context.user.id },
            include: { user: true, taskInstances: true, parentTasks: true, childTasks: true },
            orderBy: { taskInstances: { _count: 'desc' } },
        });
    },
    taskInstances: async (_parent: any, args: {
        input: {
            date: string;
        }
    }, context: Context) => {
        if (!context.user) {
            throw new Error('User not authenticated');
        }

        return await prisma.taskInstance.findMany({
            where: {
                startTime: {
                    gte: new Date(args.input.date),
                    lt: new Date(new Date(args.input.date).getTime() + 24 * 60 * 60 * 1000),
                },
                userId: context.user.id
            },
            include: {
                user: true, task: {
                    include: {
                        parentTasks: true,
                        childTasks: true,
                    },
                }
            },
        });
    },
    balanceTargets: async (_parent: any, _args: any, context: Context) => {
        if (!context.user) {
            throw new GraphQLError('User not authenticated', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                },
            });
        }
        return await prisma.balanceTarget.findMany({
            where: { userId: context.user.id },
            include: { task: true },
        });
    },
    taskSuggestions: async (_parent: any, _args: any, context: Context) => {
        if (!context.user) {
            throw new GraphQLError('User not authenticated', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                },
            });
        }

        const balanceTargets = await prisma.balanceTarget.findMany({
            where: { userId: context.user.id },
            include: { task: true },
        });

        const taskGroups = [];

        const priorityTargets = balanceTargets.filter((target) => {
            const isOnlyTargetForTask = balanceTargets.filter((t) => t.taskId === target.taskId).length === 1;
            if (isOnlyTargetForTask) {
                return true;
            } else {
                return target.timeWindow === 'WEEKLY';
            }
        })

        for (const balanceTarget of priorityTargets) {
            const childTaskPaths = await getChildTaskPaths(balanceTarget.task.id, context.user.id);

            const taskIds = Array.from(
                new Set(childTaskPaths.flat().map((task) => task.id))
            );
            const progress = await calculateProgressForTasks(taskIds, balanceTarget);

            if (progress < balanceTarget.targetAmount) {
                taskGroups.push({
                    name: balanceTarget.task.title,
                    tasks: childTaskPaths.length > 0
                        ? childTaskPaths.map((path) => path[path.length - 1])
                        : [balanceTarget.task],
                    type: "balanceTarget",
                    data: balanceTarget,
                });
            }
        }

        return taskGroups;
    }
}