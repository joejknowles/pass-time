import { admin } from '@/lib/firebaseAdmin';
import { Context as BaseContext } from '@apollo/client';
import { PrismaClient, TaskInstance, User } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';

const prisma = new PrismaClient();

export type Context = BaseContext & { user: User | null };

const isTaskHierarchyValid = async (
    taskId: number,
    parentTaskId: number,
    userId: number
) => {
    const checkUpwards = async (parentTaskId: number, mainTaskId: number, depth: number): Promise<number> => {
        if (parentTaskId === mainTaskId) {
            throw new Error('Cyclic task hierarchy detected');
        }

        const task = await prisma.task.findUnique({
            where: { id: parentTaskId, userId },
            include: { parentTasks: true },
        });

        let maxDepth = depth;
        if (task) {
            for (const parent of task.parentTasks) {
                maxDepth = Math.max(maxDepth, await checkUpwards(parent.id, mainTaskId, depth + 1));
            }
        }
        return maxDepth;
    };

    const checkDownwards = async (childTaskId: number, requestedParentTaskId: number, depth: number): Promise<number> => {
        if (requestedParentTaskId === childTaskId) {
            throw new Error('Cyclic task hierarchy detected');
        }

        const task = await prisma.task.findUnique({
            where: { id: childTaskId, userId },
            include: { childTasks: true },
        });

        let maxDepth = depth;
        if (task) {
            for (const child of task.childTasks) {
                maxDepth = Math.max(maxDepth, await checkDownwards(child.id, requestedParentTaskId, depth + 1));
            }
        }
        return maxDepth;
    };

    const upwardDepth = await checkUpwards(parentTaskId, taskId, 1);
    const downwardDepth = await checkDownwards(taskId, parentTaskId, 1);

    if (upwardDepth + downwardDepth - 1 > 20) {
        throw new Error('Task hierarchy chain exceeds 20 tasks');
    }

    return true;
}

export const resolvers = {
    Query: {
        tasks: async (_parent: any, _args: any, context: Context) => {
            if (!context.user) {
                throw new Error('User not authenticated');
            }
            return await prisma.task.findMany({
                where: { userId: context.user.id },
                include: { user: true, taskInstances: true, parentTasks: true, childTasks: true },
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
    },
    Mutation: {
        createUser: async (_: any, args: { email: string, firebaseId: string, token: string }) => {
            const decodedToken = await admin.auth().verifyIdToken(args.token);

            if (decodedToken.uid !== args.firebaseId) {
                throw new Error('Firebase ID does not match token');
            }

            const result = await prisma.user.create({
                data: { email: args.email, firebaseId: args.firebaseId },
            });

            return result
        },
        createTaskInstance: async (
            _parent: unknown,
            args: {
                input: {
                    title?: string,
                    taskId?: number,
                    start: {
                        date: string,
                        hour: number,
                        minute: number,
                    },
                    duration: number,
                }
            },
            context: Context,
            _info: GraphQLResolveInfo
        ) => {
            const { user } = context;

            if (!user) {
                throw new Error('User not authenticated');
            }

            let task = null;

            if (!args.input.title && !args.input.taskId) {
                throw new Error('Title or TaskId must be provided');
            }

            if (args.input.title && !args.input.taskId) {
                task = await prisma.task.create({
                    data: {
                        title: args.input.title,
                        userId: user.id,
                        taskInstances: {
                            create: [],
                        },
                    },
                    include: {
                        user: true,
                        taskInstances: true,
                        parentTasks: true,
                        childTasks: true
                    },
                });
            } else if (args.input.taskId) {
                task = await prisma.task.findUnique({
                    where: { id: args.input.taskId, userId: user.id },
                    include: { user: true, taskInstances: true, parentTasks: true, childTasks: true },
                });
            }

            if (!task) {
                throw new Error('No task found or created');
            }

            const startTime = new Date(args.input.start.date);
            startTime.setHours(args.input.start.hour);
            startTime.setMinutes(args.input.start.minute);

            const newTaskInstance = await prisma.taskInstance.create({
                data: {
                    userId: user.id,
                    taskId: task?.id,
                    startTime,
                    duration: args.input.duration,
                },
                include: {
                    user: true,
                    task: true,
                },
            });

            return newTaskInstance;
        },
        updateTaskInstance: async (
            _parent: unknown,
            args: { input: { id: string; title?: string; duration?: number; start?: { date?: string; hour?: number; minute?: number } } },
            context: Context,
            _info: GraphQLResolveInfo
        ) => {
            const { user } = context;
            const { id, title, duration, start } = args.input;

            if (!user) {
                throw new Error('User not authenticated');
            }

            const taskInstanceId = parseInt(id, 10);
            if (isNaN(taskInstanceId)) {
                throw new Error('Invalid TaskInstance ID');
            }

            let taskInstance = await prisma.taskInstance.findUnique({
                where: { id: taskInstanceId, userId: user.id },
                include: { user: true, task: true },
            });

            if (!taskInstance) {
                throw new Error('Task instance not found');
            }

            let startTime = null;
            if (start?.date && start?.hour != null && start?.minute != null) {
                startTime = new Date(start.date);
                startTime.setHours(start.hour);
                startTime.setMinutes(start.minute);
            }

            if (startTime || duration) {
                taskInstance = await prisma.taskInstance.update({
                    where: { id: taskInstanceId, userId: user.id },
                    data: {
                        ...(duration && { duration }),
                        ...(startTime && { startTime }),
                    },
                    include: { task: true, user: true },
                });
            }

            if (title) {
                const task = await prisma.task.update({
                    where: { id: taskInstance.taskId, userId: user.id },
                    data: { title },
                    include: { user: true, taskInstances: true, parentTasks: true, childTasks: true },
                });
                taskInstance.task = task;
            }

            return taskInstance;
        },
        deleteTaskInstance: async (_: any, args: { id: string }, context: Context) => {
            const { user } = context;
            const taskInstanceId = parseInt(args.id, 10);

            if (!user) {
                throw new Error('User not authenticated');
            }

            if (isNaN(taskInstanceId)) {
                throw new Error('Invalid TaskInstance ID');
            }

            const taskInstance = await prisma.taskInstance.findUnique({
                where: { id: taskInstanceId, userId: user.id },
                include: {
                    user: true, task: {
                        include: {
                            taskInstances: true,
                            parentTasks: true,
                            childTasks: true,
                        },
                    }
                },
            });

            if (!taskInstance) {
                throw new Error('Task instance not found');
            }

            const taskId = taskInstance.taskId;
            const wasOnlyUseOfTask =
                taskInstance.task.taskInstances.length === 1 &&
                taskInstance.task.parentTasks.length === 0 &&
                taskInstance.task.childTasks.length === 0;

            await prisma.taskInstance.delete({
                where: { id: taskInstanceId, userId: user.id },
            });

            if (wasOnlyUseOfTask) {
                await prisma.task.delete({
                    where: { id: taskId, userId: user.id },
                });
            }

            return true;
        },
        updateTask: async (
            _parent: unknown,
            args: { input: { id: string; title?: string; parentTaskId?: number } },
            context: Context,
            _info: GraphQLResolveInfo
        ) => {
            const { user } = context;
            const { id, title, parentTaskId } = args.input;

            if (!user) {
                throw new Error('User not authenticated');
            }

            const taskId = parseInt(id, 10);
            if (isNaN(taskId)) {
                throw new Error('Invalid Task ID');
            }

            let task = await prisma.task.findUnique({
                where: { id: taskId, userId: user.id },
                include: { user: true, taskInstances: true, parentTasks: true, childTasks: true },
            });

            if (!task) {
                throw new Error('Task not found');
            }

            if (title) {
                task = await prisma.task.update({
                    where: { id: taskId, userId: user.id },
                    data: { title },
                    include: { user: true, taskInstances: true, parentTasks: true, childTasks: true },
                });
            }

            if (parentTaskId) {
                const hasValidHierarchy = await isTaskHierarchyValid(taskId, parentTaskId, user.id);

                await prisma.task.update({
                    where: { id: parentTaskId, userId: user.id },
                    data: {
                        childTasks: {
                            connect: { id: taskId },
                        },
                    },
                });


                task = await prisma.task.findUnique({
                    where: { id: taskId, userId: user.id },
                    include: { user: true, taskInstances: true, parentTasks: true, childTasks: true },
                });
            }

            return task;
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
};
