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

        const tasks = await prisma.task.findMany({
            where: { userId: context.user.id },
            include: { user: true, taskInstances: true, parentTasks: true, childTasks: true },
            orderBy: { taskInstances: { _count: 'desc' } },
        });

        return tasks.map(task => ({
            ...task,
            defaultDuration: task.defaultDuration || 30,
        }));
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
                return target.timeWindow === 'DAILY';
            }
        })

        for (const balanceTarget of priorityTargets) {
            const childTaskPaths = await getChildTaskPaths(balanceTarget.task.id, context.user.id);

            const taskIds = Array.from(
                new Set(childTaskPaths.flat().map((task) => task.id))
            );
            const progress = await calculateProgressForTasks(taskIds, balanceTarget);

            if (progress < balanceTarget.targetAmount) {
                const remainingChildTasks: { id: number, title: string }[][] = JSON.parse(JSON.stringify(childTaskPaths));
                const orderedTaskList: { id: number, title: string }[] = [];

                while (remainingChildTasks.every((path) => path.length > 0)) {
                    // Orders tasks by lowest level child tasks first
                    let longestPathLength = 0;
                    for (const path of remainingChildTasks) {
                        if (path.length > longestPathLength) {
                            longestPathLength = path.length;
                        }
                    }

                    for (const path of remainingChildTasks) {
                        if (path.length === longestPathLength) {
                            const task = path.pop() as { id: number, title: string };
                            if (!orderedTaskList.find((t) => t.id === task.id)) {
                                orderedTaskList.push(task);
                            }
                        }
                    }
                }

                taskGroups.push({
                    name: balanceTarget.task.title,
                    tasks: orderedTaskList.length > 0
                        ? orderedTaskList
                        : [balanceTarget.task],
                    type: "balanceTarget",
                    data: balanceTarget,
                });
            }
        }

        return taskGroups;
    }
}