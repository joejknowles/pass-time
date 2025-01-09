import { Box, Typography, FormControlLabel, Switch } from "@mui/material";
import { useState } from "react";
import { RecurringOrNotCardsSelect } from "./RecurringOrNotCardsSelect";
import { RecurringInputs } from "./RecurringInputs";

interface SuggestionsConfig {
    taskType: "RECURRING" | "ONE_OFF";
}

export const TaskDetailsSuggestions = () => {
    const [suggestionsEnabled, setSuggestionsEnabled] = useState<boolean>(true);
    const [suggestionsConfig, setSuggestionsConfig] = useState<SuggestionsConfig>({ taskType: "RECURRING" });

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
                        {suggestionsConfig.taskType === "RECURRING" && <RecurringInputs />}
                    </Box>
                )
            }
        </Box>
    );
};
