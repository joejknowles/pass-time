import { BalanceTarget } from "@prisma/client";
import { prisma } from "./helpers";

export const calculateProgressForTasks = async (taskIds: number[], balanceTarget: BalanceTarget): Promise<number> => {
    const now = new Date();
    const dayNumberToday = now.getDay();
    // Makes week start on Monday
    const numberOfDaysSinceStartOfWeek = dayNumberToday === 0 ? 6 : dayNumberToday - 1;

    const timeRange = balanceTarget.timeWindow === 'DAILY'
        ? {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(24, 0, 0, 0)),
        }
        : {
            gte: new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000 * numberOfDaysSinceStartOfWeek),
            lt: new Date(new Date().setHours(24, 0, 0, 0)),
        };

    const taskInstances = await prisma.taskInstance.findMany({
        where: {
            taskId: { in: taskIds },
            startTime: timeRange,
        },
    });

    return taskInstances.reduce((total, instance) => {
        const elapsed = Math.max(0, now.getTime() - instance.startTime.getTime());
        return total + Math.min(instance.duration, elapsed / (60 * 1000));
    }, 0);
};
