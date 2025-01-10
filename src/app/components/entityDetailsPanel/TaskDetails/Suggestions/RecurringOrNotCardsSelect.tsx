import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import EventIcon from '@mui/icons-material/Event';
import RepeatIcon from '@mui/icons-material/Repeat';
import { SuggestionsConfig } from "./types";

interface RecurringOrNotCardsSelectProps {
    suggestionsConfig: SuggestionsConfig;
    setSuggestionsConfig: (config: SuggestionsConfig) => void;
}

export const RecurringOrNotCardsSelect = ({ suggestionsConfig, setSuggestionsConfig }: RecurringOrNotCardsSelectProps) => {
    const theme = useTheme();

    return (
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
            <Card
                sx={{
                    width: 100,
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: suggestionsConfig.taskType === "RECURRING" ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                    boxShadow: 3,
                    backgroundColor: suggestionsConfig.taskType === "RECURRING" ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                }}
                onClick={() => setSuggestionsConfig({ ...suggestionsConfig, taskType: "RECURRING" })}
            >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '8px !important' }}>
                    <RepeatIcon fontSize="large" sx={{ color: suggestionsConfig.taskType === "RECURRING" ? theme.palette.custom.cardIconSelected : theme.palette.grey[700] }} />
                    <Typography variant="caption" sx={{ color: suggestionsConfig.taskType === "RECURRING" ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>Recurring</Typography>
                </CardContent>
            </Card>
            <Card
                sx={{
                    width: 100,
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: suggestionsConfig.taskType === "ONE_OFF" ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                    boxShadow: 3,
                    backgroundColor: suggestionsConfig.taskType === "ONE_OFF" ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                }}
                onClick={() => setSuggestionsConfig({ ...suggestionsConfig, taskType: "ONE_OFF" })}
            >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '8px !important' }}>
                    <EventIcon fontSize="large" sx={{ color: suggestionsConfig.taskType === "ONE_OFF" ? theme.palette.custom.cardIconSelected : theme.palette.grey[600] }} />
                    <Typography variant="caption" sx={{ color: suggestionsConfig.taskType === "ONE_OFF" ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>One-off</Typography>
                </CardContent>
            </Card>
        </Box>
    );
};
