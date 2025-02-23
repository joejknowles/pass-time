// gradually migrating to `throw new GraphQLError` instead of `throw new Error`
import { Context as BaseContext } from '@apollo/client';
import { PrismaClient, Task, User } from '@prisma/client';
import { GraphQLError } from 'graphql';

export const prisma = new PrismaClient();
export type Context = BaseContext & { user: User | null };

type PROGRESS_TIME_WINDOWS = 'DAILY' | 'WEEKLY' | 'ALL_TIME';

export const calculateProgress = async (taskId: number, timeWindow: PROGRESS_TIME_WINDOWS, userId: number, depth: number = 0): Promise<number> => {
    if (depth > 20) {
        throw new GraphQLError("Too many nested tasks");
    }

    const now = new Date();

    let timeRange = {}
    if (timeWindow === 'WEEKLY') {
        const dayNumberToday = now.getDay();
        // starts Monday
        const numberOfDaysSinceStartOfWeek = dayNumberToday === 0
            ? 6
            : dayNumberToday - 1;
        timeRange = {
            gte: new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000 * numberOfDaysSinceStartOfWeek),
            lt: new Date(new Date().setHours(24, 0, 0, 0)),
        };
    } else if (timeWindow === 'DAILY') {
        timeRange = {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(24, 0, 0, 0)),
        };
    }

    const task = await prisma.task.findUnique({
        where: {
            id: taskId,
            userId: userId,
        },
        include: {
            childTasks: true,
            taskInstances: {
                where: {
                    startTime: timeRange,
                }
            }
        },
    });

    if (!task) {
        return 0;
    }

    let totalDuration = 0;

    totalDuration += task.taskInstances.reduce((sum, instance) => {
        const elapsed = Math.max(0, now.getTime() - instance.startTime.getTime());
        return sum + Math.min(instance.duration, elapsed / (60 * 1000));
    }, 0);

    for (const childTask of task.childTasks) {
        totalDuration += await calculateProgress(childTask.id, timeWindow, userId, depth + 1);
    }

    return totalDuration;
};

export const getAllChildTasks = async (taskId: number, userId: number): Promise<Task[]> => {
    const task = await prisma.task.findUnique({
        where: { id: taskId, userId },
        include: { childTasks: true },
    });

    if (!task) {
        return [];
    }

    let allChildTasks = [...task.childTasks];

    for (const childTask of task.childTasks) {
        const grandChildTasks = await getAllChildTasks(childTask.id, userId);
        allChildTasks = allChildTasks.concat(grandChildTasks);
    }

    return allChildTasks;
};
