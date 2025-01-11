import { Task, TaskSuggestionConfig } from "@prisma/client";
import { getChildTaskPaths } from "../../../helpers/getChildTaskPaths";
import { prisma } from "../../../helpers/helpers";

const MS_IN_A_DAY = 24 * 60 * 60 * 1000;
export async function addDaysSinceLastOccurrenceSuggestions(suggestions: (TaskSuggestionConfig & { task: Task })[], userId: number, taskGroups: any[]) {
    for (const suggestion of suggestions) {
        const allChildTasks = await getChildTaskPaths(suggestion.task.id, userId);
        const taskIds = Array.from(
            new Set([
                ...allChildTasks.flat().map((task) => task.id),
                suggestion.task.id
            ])
        );

        const startOfToday = new Date().setHours(0, 0, 0, 0);

        const aTaskDoneInLastXDays = await prisma.taskInstance.findFirst({
            where: {
                taskId: {
                    in: taskIds,
                },
                startTime: {
                    gte: new Date(startOfToday - MS_IN_A_DAY * ((suggestion.daysSinceLastOccurrence || 3) - 1)),
                    lt: new Date(startOfToday + MS_IN_A_DAY),
                },
            },
        });


        if (!aTaskDoneInLastXDays) {
            taskGroups.push({
                name: suggestion.task.title,
                tasks: [suggestion.task],
                type: "RECURRING",
            });
        }
    }
}

