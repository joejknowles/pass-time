export const RECURRING_TYPES = {
    DAYS_SINCE_LAST_OCCURRENCE: "DAYS_SINCE_LAST_OCCURRENCE" as const,
    SPECIFIC_DAY: "SPECIFIC_DAY" as const
};
export interface TaskSuggestionsConfig {
    taskType: "RECURRING" | "ONE_OFF";
    daysSinceLastOccurrence: number;
    specificDay: string;
    recurringType: (typeof RECURRING_TYPES)[keyof typeof RECURRING_TYPES];
}
