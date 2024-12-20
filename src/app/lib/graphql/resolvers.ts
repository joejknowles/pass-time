import { Context as BaseContext } from '@apollo/client';
import { PrismaClient, TaskInstance, User } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';

const prisma = new PrismaClient();

export type Context = BaseContext & { user: User | null };

export const resolvers = {
    Query: {
        users: async () => {
            return await prisma.user.findMany({
                include: { tasks: true, taskInstances: true },
            });
        },
        tasks: async (_parent: any, _args: any, context: Context) => {
            if (!context.user) {
                throw new Error('User not authenticated');
            }
            return await prisma.task.findMany({
                where: { userId: context.user.id },
                include: { user: true, taskInstances: true },
            });
        },
        taskInstances: async (_parent: any, args: {
            input: {
                date: string;
            }
        }) => {
            return await prisma.taskInstance.findMany({
                where: {
                    startTime: {
                        gte: new Date(args.input.date),
                        lt: new Date(new Date(args.input.date).getTime() + 24 * 60 * 60 * 1000),
                    }
                },
                include: { user: true, task: true },
            });
        },
    },
    Mutation: {
        createUser: async (_: any, args: { email: string, firebaseId: string }) => {
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
            if (args.input.title && !args.input.taskId) {
                const newTask = await prisma.task.create({
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
                    },
                });
            } else if (args.input.taskId) {
                task = await prisma.task.findUnique({
                    where: { id: args.input.taskId, userId: user.id },
                    include: { user: true, taskInstances: true },
                });
            }

            if (!task) {
                throw new Error('Task not found');
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
                    where: { id: taskInstanceId },
                    data: {
                        ...(duration && { duration }),
                        ...(startTime && { startTime }),
                    },
                    include: { task: true, user: true },
                });
            }

            if (title) {
                const task = await prisma.task.update({
                    where: { id: taskInstance.taskId },
                    data: { title },
                    include: { user: true, taskInstances: true },
                });
                taskInstance.task = task;
            }

            return taskInstance;
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
