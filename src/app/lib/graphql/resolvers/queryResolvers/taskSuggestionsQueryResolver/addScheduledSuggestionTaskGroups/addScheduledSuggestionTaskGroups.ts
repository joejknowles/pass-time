import { prisma } from "../../../helpers/helpers";
import { addDaysSinceLastOccurrenceSuggestions } from "./addDaysSinceLastOccurrenceSuggestions";
import { addSpecificDaySuggestions } from "./addSpecificDaySuggestions";

const RECURRING_OR_ONCE = {
    RECURRING: 'RECURRING' as const,
    ONE_OFF: 'ONE_OFF' as const,
};

const RECURRING_TYPES = {
    DAYS_SINCE_LAST_OCCURRENCE: "DAYS_SINCE_LAST_OCCURRENCE" as const,
    SPECIFIC_DAYS: "SPECIFIC_DAYS" as const
};

const ONE_OFF_DATE_TYPES = {
    ON_DATE_ONLY: "ON_DATE_ONLY" as const,
    BEFORE_OR_ON: "BEFORE_OR_ON" as const
};

export const addScheduledSuggestionTaskGroups = async (taskGroups: any[], userId: number) => {
    const taskSuggestions = await prisma.taskSuggestionConfig.findMany({
        where: {
            userId: userId,
            task: { isSuggestingEnabled: true },
            OR: [
                { recurringOrOnce: RECURRING_OR_ONCE.RECURRING },
                {
                    recurringOrOnce: RECURRING_OR_ONCE.ONE_OFF,
                    OR: [
                        { oneOffDateType: ONE_OFF_DATE_TYPES.ON_DATE_ONLY, oneOffDate: new Date().toISOString().split('T')[0] },
                        { oneOffDateType: ONE_OFF_DATE_TYPES.BEFORE_OR_ON, oneOffDate: { gte: new Date().toISOString().split('T')[0] } }
                    ]
                },
            ],
        },
        include: { task: true },
    });

    const recurringTaskSuggestions = taskSuggestions.filter((suggestion) => !suggestion.recurringOrOnce || suggestion.recurringOrOnce === RECURRING_OR_ONCE.RECURRING);

    const dayOfWeekSuggestions = recurringTaskSuggestions.filter((suggestion) => suggestion.recurringType === RECURRING_TYPES.SPECIFIC_DAYS);
    await addSpecificDaySuggestions(dayOfWeekSuggestions, userId, taskGroups);

    const daysSinceLastOccurrenceSuggestions = recurringTaskSuggestions.filter((suggestion) => !suggestion.recurringType || suggestion.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE);
    await addDaysSinceLastOccurrenceSuggestions(daysSinceLastOccurrenceSuggestions, userId, taskGroups);

    const oneOffDateSuggestions = taskSuggestions.filter((suggestion) => suggestion.recurringOrOnce === RECURRING_OR_ONCE.ONE_OFF);

    const dueSoonSuggestions = oneOffDateSuggestions.filter((suggestion) => suggestion.oneOffDateType === ONE_OFF_DATE_TYPES.BEFORE_OR_ON);
    if (dueSoonSuggestions.length > 0) {
        taskGroups.push({
            name: "Due soon",
            tasks: dueSoonSuggestions.map((suggestion) => suggestion.task),
            type: "DATE_SOON",
        });
    }

    const onDateSuggestions = oneOffDateSuggestions.filter((suggestion) => suggestion.oneOffDateType === ONE_OFF_DATE_TYPES.ON_DATE_ONLY);
    if (onDateSuggestions.length > 0) {
        taskGroups.unshift({
            name: "Due today!",
            tasks: onDateSuggestions.map((suggestion) => suggestion.task),
            type: "DATE_TODAY",
        });
    }

    return taskGroups;
}
