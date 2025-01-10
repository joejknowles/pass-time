import { getChildTaskPaths } from "../../helpers/getChildTaskPaths";
import { prisma } from "../../helpers/helpers";

const RECURRING_OR_ONCE = {
    RECURRING: 'RECURRING',
    ONE_OFF: 'ONE_OFF',
};

const RECURRING_TYPES = {
    DAYS_SINCE_LAST_OCCURRENCE: "DAYS_SINCE_LAST_OCCURRENCE" as const,
    SPECIFIC_DAYS: "SPECIFIC_DAYS" as const
};

const relevantDayNumbersForSpecificDays = {
    MONDAY: [1],
    TUESDAY: [2],
    WEDNESDAY: [3],
    THURSDAY: [4],
    FRIDAY: [5],
    SATURDAY: [6],
    SUNDAY: [0],
    EVERYDAY: [0, 1, 2, 3, 4, 5, 6],
    WEEKDAY: [1, 2, 3, 4, 5],
    WEEKEND: [0, 6],
}

export const addScheduledSuggestionTaskGroups = async (taskGroups: any[], userId: number) => {
    const taskSuggestions = await prisma.taskSuggestionConfig.findMany({
        where: {
            userId: userId, task: {
                OR: [{ isSuggestingEnabled: true }, { isSuggestingEnabled: null }]
            },
        },
        include: { task: true },
    });

    const recurringTaskSuggestions = taskSuggestions.filter((suggestion) => !suggestion.recurringOrOnce || suggestion.recurringOrOnce === RECURRING_OR_ONCE.RECURRING);
    const dayOfWeekSuggestions = recurringTaskSuggestions.filter((suggestion) => suggestion.recurringType === RECURRING_TYPES.SPECIFIC_DAYS);

    dayOfWeekSuggestions.forEach(async (suggestion) => {
        const relevantDayNumbers = relevantDayNumbersForSpecificDays[
            (suggestion.specificDays || "SUNDAY") as keyof typeof relevantDayNumbersForSpecificDays
        ];
        const dayOfWeek = new Date().getDay();
        if (relevantDayNumbers.includes(dayOfWeek)) {
            const allChildTasks = await getChildTaskPaths(suggestion.task.id, userId);

            const taskIds = Array.from(
                new Set([
                    ...allChildTasks.flat().map((task) => task.id),
                    suggestion.task.id
                ])
            );

            const anyTasksDoneToday = await prisma.taskInstance.findFirst({
                where: {
                    taskId: {
                        in: taskIds,
                    },
                    startTime: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000),
                    },
                },
            });

            if (!anyTasksDoneToday) {
                taskGroups.push({
                    name: suggestion.task.title,
                    tasks: [suggestion.task],
                    type: "RECURRING",
                });
            }
        }
    });

    return taskGroups;
}
