import { Task, TaskSuggestionConfig } from "@prisma/client";
import { getChildTaskPaths } from "../../../helpers/getChildTaskPaths";
import { prisma } from "../../../helpers/helpers";

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
export function addSpecificDaySuggestions(dayOfWeekSuggestions: (TaskSuggestionConfig & { task: Task })[], userId: number, taskGroups: any[]) {
    dayOfWeekSuggestions.forEach(async (suggestion) => {
        const relevantDayNumbers = relevantDayNumbersForSpecificDays[(suggestion.specificDays || "SUNDAY") as keyof typeof relevantDayNumbersForSpecificDays];
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
}

