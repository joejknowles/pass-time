import { Context } from '@apollo/client';
import { PrismaClient } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';

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
        createTask: async (
            _parent: unknown,
            args: { input: { title: string } },
            context: Context,
            _info: GraphQLResolveInfo
        ) => {
            const { user } = context;

            if (!user) {
                throw new Error('User not authenticated');
            }

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

            return newTask;
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
