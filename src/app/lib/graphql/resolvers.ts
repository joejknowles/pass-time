import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const resolvers = {
    Query: {
        users: async () => {
            return await prisma.user.findMany({
                include: { tasks: true, taskInstances: true },
            });
        },
        tasks: async () => {
            return await prisma.task.findMany({
                include: { user: true, taskInstances: true },
            });
        },
        taskInstances: async () => {
            return await prisma.taskInstance.findMany({
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
        createTask: async (_: any, args: { userId: number; title: string }) => {
            return await prisma.task.create({
                data: { userId: args.userId, title: args.title },
            });
        },
        createTaskInstance: async (
            _: any,
            args: { userId: number; taskId: number; startTime: string; duration?: number }
        ) => {
            return await prisma.taskInstance.create({
                data: {
                    userId: args.userId,
                    taskId: args.taskId,
                    startTime: new Date(args.startTime),
                    duration: args.duration ?? 60,
                },
            });
        },
    },
};
