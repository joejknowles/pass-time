import { Box, Typography, FormControlLabel, Switch } from "@mui/material";
import { useState } from "react";
import { RecurringOrNotCardsSelect } from "./RecurringOrNotCardsSelect";
import { RecurringInputs } from "./RecurringInputs";
import { SuggestionsConfig, RECURRING_TYPES } from "./types";

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
