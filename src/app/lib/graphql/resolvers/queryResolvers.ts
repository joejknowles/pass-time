// gradually migrating to `throw new GraphQLError` instead of `throw new Error`
import { GraphQLError } from 'graphql';
import { calculateProgress, Context, getAllChildTasks, prisma } from './helpers/helpers';

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
            include: { task: { include: { childTasks: true } } },
        });

        const taskGroups = [];

        for (const balanceTarget of balanceTargets) {
            const progress = await calculateProgress(balanceTarget.taskId, balanceTarget);
            if (progress < balanceTarget.targetAmount) {
                const childTasks = await getAllChildTasks(balanceTarget.task.id, context.user.id);
                taskGroups.push({
                    name: balanceTarget.task.title,
                    tasks: childTasks.length > 0 ? childTasks : [balanceTarget.task],
                    type: "balanceTarget",
                    data: balanceTarget,
                });
            }
        }

        return taskGroups;
    },
}