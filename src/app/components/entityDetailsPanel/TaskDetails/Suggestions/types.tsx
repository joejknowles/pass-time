export const RECURRING_TYPES = {
    DAYS_SINCE_LAST_OCCURRENCE: "DAYS_SINCE_LAST_OCCURRENCE" as const,
    SPECIFIC_DAYS: "SPECIFIC_DAYS" as const
};

export type RecurringOrOnce = "RECURRING" | "ONE_OFF" | "SOON";
export type RecurringType = keyof typeof RECURRING_TYPES;

export interface TaskSuggestionsConfig {
    recurringOrOnce: RecurringOrOnce;
    recurringType: RecurringType;
    daysSinceLastOccurrence: number;
    specificDays: string;
    oneOffDate: string;
    oneOffDateType: "ON_DATE_ONLY" | "BEFORE_OR_ON";
}
