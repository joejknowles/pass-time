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
        createTaskInstance: async (
            _parent: unknown,
            args: {
                input: {
                    title: string,
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

            const startTime = new Date(args.input.start.date);
            startTime.setHours(args.input.start.hour);
            startTime.setMinutes(args.input.start.minute);

            const newTaskInstance = await prisma.taskInstance.create({
                data: {
                    userId: user.id,
                    taskId: newTask.id,
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
    },
    TaskInstance: {
        start: (parent: any) => {
            const startTime = new Date(parent.startTime);
            return {
                date: startTime.toISOString().split('T')[0],
                hour: startTime.getUTCHours(),
                minute: startTime.getUTCMinutes(),
            };
        },
    },
};
