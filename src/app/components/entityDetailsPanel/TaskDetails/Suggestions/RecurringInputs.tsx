import { Box, TextField, Typography } from "@mui/material";

interface SuggestionsConfig {
    taskType: "RECURRING" | "ONE_OFF";
}

interface RecurringInputsProps {
    suggestionsConfig: SuggestionsConfig;
    setSuggestionsConfig: (config: SuggestionsConfig) => void;
}

export const RecurringInputs: React.FC<RecurringInputsProps> = ({ suggestionsConfig, setSuggestionsConfig }) => {
    return (
        <Box mt={2}>
            <Typography variant="subtitle1">Recurring Settings</Typography>
            <TextField label="Frequency" variant="outlined" fullWidth margin="normal" />
            <TextField label="Interval" variant="outlined" fullWidth margin="normal" />
        </Box>
    );
};
