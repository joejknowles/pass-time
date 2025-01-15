import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import EventIcon from '@mui/icons-material/Event';
import RepeatIcon from '@mui/icons-material/Repeat';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { TaskSuggestionsConfig } from "./types";

interface RecurringOrNotCardsSelectProps {
    suggestionsConfig: TaskSuggestionsConfig;
    handleConfigChange: (config: Partial<TaskSuggestionsConfig>) => void;
}

export const RecurringOrNotCardsSelect = ({ suggestionsConfig, handleConfigChange }: RecurringOrNotCardsSelectProps) => {
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
                    border: suggestionsConfig.recurringOrOnce === "RECURRING" ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                    boxShadow: 3,
                    backgroundColor: suggestionsConfig.recurringOrOnce === "RECURRING" ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                }}
                onClick={() => handleConfigChange({ recurringOrOnce: "RECURRING" })}
            >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '8px !important' }}>
                    <RepeatIcon fontSize="large" sx={{ color: suggestionsConfig.recurringOrOnce === "RECURRING" ? theme.palette.custom.cardIconSelected : theme.palette.grey[700] }} />
                    <Typography variant="caption" sx={{ color: suggestionsConfig.recurringOrOnce === "RECURRING" ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>Recurring</Typography>
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
                    border: suggestionsConfig.recurringOrOnce === "ONE_OFF" ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                    boxShadow: 3,
                    backgroundColor: suggestionsConfig.recurringOrOnce === "ONE_OFF" ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                }}
                onClick={() => handleConfigChange({
                    recurringOrOnce: "ONE_OFF",
                    oneOffDate: suggestionsConfig.oneOffDate,
                    oneOffDateType: suggestionsConfig.oneOffDateType
                })}
            >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '8px !important' }}>
                    <EventIcon fontSize="large" sx={{ color: suggestionsConfig.recurringOrOnce === "ONE_OFF" ? theme.palette.custom.cardIconSelected : theme.palette.grey[600] }} />
                    <Typography variant="caption" sx={{ color: suggestionsConfig.recurringOrOnce === "ONE_OFF" ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>One-off</Typography>
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
                    border: suggestionsConfig.recurringOrOnce === "SOON" ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                    boxShadow: 3,
                    backgroundColor: suggestionsConfig.recurringOrOnce === "SOON" ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                }}
                onClick={() => handleConfigChange({ recurringOrOnce: "SOON" })}
            >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '8px !important' }}>
                    <HelpOutlineIcon fontSize="large" sx={{ color: suggestionsConfig.recurringOrOnce === "SOON" ? theme.palette.custom.cardIconSelected : theme.palette.grey[600] }} />
                    <Typography variant="caption" sx={{ color: suggestionsConfig.recurringOrOnce === "SOON" ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>Soon</Typography>
                </CardContent>
            </Card>
        </Box>
    );
};
