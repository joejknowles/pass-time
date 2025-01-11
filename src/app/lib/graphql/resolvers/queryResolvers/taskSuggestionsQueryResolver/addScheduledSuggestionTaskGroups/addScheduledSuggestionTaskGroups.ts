import { prisma } from "../../../helpers/helpers";
import { addDaysSinceLastOccurrenceSuggestions } from "./addDaysSinceLastOccurrenceSuggestions";
import { addSpecificDaySuggestions } from "./addSpecificDaySuggestions";

const RECURRING_OR_ONCE = {
    RECURRING: 'RECURRING',
    ONE_OFF: 'ONE_OFF',
};

const RECURRING_TYPES = {
    DAYS_SINCE_LAST_OCCURRENCE: "DAYS_SINCE_LAST_OCCURRENCE" as const,
    SPECIFIC_DAYS: "SPECIFIC_DAYS" as const
};

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
    await addSpecificDaySuggestions(dayOfWeekSuggestions, userId, taskGroups);

    const daysSinceLastOccurrenceSuggestions = recurringTaskSuggestions.filter((suggestion) => !suggestion.recurringType || suggestion.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE);
    await addDaysSinceLastOccurrenceSuggestions(daysSinceLastOccurrenceSuggestions, userId, taskGroups);

    return taskGroups;
}
