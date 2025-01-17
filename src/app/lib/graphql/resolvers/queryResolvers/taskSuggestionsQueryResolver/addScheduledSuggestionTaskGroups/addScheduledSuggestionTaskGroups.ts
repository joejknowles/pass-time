import { prisma } from "../../../helpers/helpers";
import { addDaysSinceLastOccurrenceSuggestions } from "./addDaysSinceLastOccurrenceSuggestions";
import { addSpecificDaySuggestions } from "./addSpecificDaySuggestions";

const SUGGESTION_TIMING_TYPE = {
    RECURRING: 'RECURRING' as const,
    DUE_DATE: 'DUE_DATE' as const,
    SOON: 'SOON' as const,
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
                { suggestionTimingType: SUGGESTION_TIMING_TYPE.RECURRING },
                {
                    suggestionTimingType: SUGGESTION_TIMING_TYPE.SOON,
                    // TODO: performance issue here, need to optimize
                    task: { taskInstances: { none: {} } }
                },
                {
                    suggestionTimingType: SUGGESTION_TIMING_TYPE.DUE_DATE,
                    OR: [
                        { dueDateType: ONE_OFF_DATE_TYPES.ON_DATE_ONLY, dueDate: new Date().toISOString().split('T')[0] },
                        { dueDateType: ONE_OFF_DATE_TYPES.BEFORE_OR_ON, dueDate: { gte: new Date().toISOString().split('T')[0] } }
                    ]
                },
            ],
        },
        include: {
            task: { include: { taskInstances: true } }
        },
    });

    const recurringTaskSuggestions = taskSuggestions.filter((suggestion) => !suggestion.suggestionTimingType || suggestion.suggestionTimingType === SUGGESTION_TIMING_TYPE.RECURRING);

    const dayOfWeekSuggestions = recurringTaskSuggestions.filter((suggestion) => suggestion.recurringType === RECURRING_TYPES.SPECIFIC_DAYS);
    await addSpecificDaySuggestions(dayOfWeekSuggestions, userId, taskGroups);

    const daysSinceLastOccurrenceSuggestions = recurringTaskSuggestions.filter((suggestion) => !suggestion.recurringType || suggestion.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE);
    await addDaysSinceLastOccurrenceSuggestions(daysSinceLastOccurrenceSuggestions, userId, taskGroups);

    const dueDateSuggestions = taskSuggestions.filter((suggestion) => suggestion.suggestionTimingType === SUGGESTION_TIMING_TYPE.DUE_DATE);

    const dueSoonSuggestions = dueDateSuggestions.filter((suggestion) => {
        return suggestion.dueDateType === ONE_OFF_DATE_TYPES.BEFORE_OR_ON &&
            suggestion.dueDate &&
            suggestion.dueDate > new Date().toISOString().split('T')[0];
    })
    if (dueSoonSuggestions.length > 0) {
        taskGroups.push({
            name: "Upcoming date",
            tasks: dueSoonSuggestions.map((suggestion) => suggestion.task),
            type: "DATE_SOON",
        });
    }

    const onDateSuggestions = dueDateSuggestions.filter((suggestion) => {
        return suggestion.dueDateType === ONE_OFF_DATE_TYPES.ON_DATE_ONLY ||
            suggestion.dueDateType === ONE_OFF_DATE_TYPES.BEFORE_OR_ON &&
            suggestion.dueDate === new Date().toISOString().split('T')[0];
    });
    if (onDateSuggestions.length > 0) {
        taskGroups.unshift({
            name: "Due today!",
            tasks: onDateSuggestions.map((suggestion) => suggestion.task),
            type: "DATE_TODAY",
        });
    }

    const soonSuggestions = taskSuggestions.filter((suggestion) => suggestion.suggestionTimingType === SUGGESTION_TIMING_TYPE.SOON);
    if (soonSuggestions.length > 0) {
        taskGroups.push({
            name: "Soon",
            tasks: soonSuggestions.map((suggestion) => suggestion.task),
            type: "SOON",
        });
    }

    return taskGroups;
}
