import { Box, Typography, FormControlLabel, Switch } from "@mui/material";
import { useState } from "react";
import { RecurringOrNotCardsSelect } from "./RecurringOrNotCardsSelect";
import { RecurringInputs } from "./RecurringInputs";

const RECURRING_TYPES = {
    DAYS_SINCE_LAST_OCCURRENCE: "DAYS_SINCE_LAST_OCCURRENCE" as const,
    SPECIFIC_DAY: "SPECIFIC_DAY" as const
};

interface SuggestionsConfig {
    taskType: "RECURRING" | "ONE_OFF";
    daysSinceLastOccurrence: number;
    specificDay: string;
    recurringType: typeof RECURRING_TYPES[keyof typeof RECURRING_TYPES];
}

export const TaskDetailsSuggestions = () => {
    const [suggestionsEnabled, setSuggestionsEnabled] = useState<boolean>(true);
    const [suggestionsConfig, setSuggestionsConfig] = useState<SuggestionsConfig>({
        taskType: "RECURRING",
        daysSinceLastOccurrence: 3,
        specificDay: "Sunday",
        recurringType: RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE
    });

    return (
        <Box>
            <FormControlLabel
                control={
                    <Switch
                        checked={suggestionsEnabled}
                        onChange={() => setSuggestionsEnabled(!suggestionsEnabled)}
                    />
                }
                label={`Suggestions are ${suggestionsEnabled ? "enabled" : "disabled"}`}
            />
            {
                suggestionsEnabled && (
                    <Box>
                        <RecurringOrNotCardsSelect suggestionsConfig={suggestionsConfig} setSuggestionsConfig={setSuggestionsConfig} />
                        {suggestionsConfig.taskType === "RECURRING" && <RecurringInputs suggestionsConfig={suggestionsConfig} setSuggestionsConfig={setSuggestionsConfig} />}
                    </Box>
                )
            }
        </Box>
    );
};
