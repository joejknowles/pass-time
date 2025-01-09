import { Box, TextField, Typography } from "@mui/material";

interface RecurringInputsProps {
    frequency: string;
    interval: string;
}

export const RecurringInputs: React.FC<RecurringInputsProps> = ({ frequency, interval }) => {
    return (
        <Box mt={2}>
            <Typography variant="subtitle1">Recurring Settings</Typography>
            <TextField label="Frequency" variant="outlined" fullWidth margin="normal" value={frequency} />
            <TextField label="Interval" variant="outlined" fullWidth margin="normal" value={interval} />
        </Box>
    );
};
