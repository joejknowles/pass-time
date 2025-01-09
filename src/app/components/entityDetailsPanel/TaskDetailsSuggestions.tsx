import { Box, Typography, FormControlLabel, Switch, Checkbox, FormGroup, Radio, RadioGroup } from "@mui/material";
import { useState } from "react";

export const TaskDetailsSuggestions = () => {
    const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);

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
        </Box>
    );
};
