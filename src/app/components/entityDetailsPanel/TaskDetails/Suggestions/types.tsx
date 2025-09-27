export const RECURRING_TYPES = {
  DAYS_SINCE_LAST_OCCURRENCE: "DAYS_SINCE_LAST_OCCURRENCE" as const,
  SPECIFIC_DAYS: "SPECIFIC_DAYS" as const,
};

export type SuggestionTimingType = "RECURRING" | "DUE_DATE" | "SOON";
export type RecurringType = keyof typeof RECURRING_TYPES;

export interface TaskSuggestionsConfig {
  suggestionTimingType: SuggestionTimingType;
  recurringType: RecurringType;
  daysSinceLastOccurrence: number;
  specificDays: string;
  dueDate: string;
  dueDateType: "ON_DATE_ONLY" | "BEFORE_OR_ON";
}
