import { Box, Card, CardContent, Typography, TextField, Select, MenuItem, useTheme } from "@mui/material";
import { RECURRING_TYPES, TaskSuggestionsConfig } from "./types";

interface RecurringInputsProps {
    suggestionsConfig: TaskSuggestionsConfig;
    handleConfigChange: (key: keyof TaskSuggestionsConfig, value: any) => void;
}

const specificDaysOptions = [
    "EVERYDAY", "WEEKDAY", "WEEKEND",
    "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"
];

const formatSpecificDays = (day: string) => {
    return day.charAt(0) + day.slice(1).toLowerCase();
};

export const RecurringInputs: React.FC<RecurringInputsProps> = ({ suggestionsConfig, handleConfigChange }) => {
    const theme = useTheme();

    const isDaysSince = suggestionsConfig.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE;
    const isSpecificDays = suggestionsConfig.recurringType === RECURRING_TYPES.SPECIFIC_DAYS;


    return (
        <Box mt={3}>
            <Box component="hr" sx={{ borderTop: theme.palette.grey[300], marginBottom: 3, }} />
            <Box display="flex" flexDirection="column" gap={2}>
                <Card
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: isDaysSince ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                        boxShadow: 3,
                        backgroundColor: isDaysSince ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                    }}
                    onClick={!isDaysSince ? () => handleConfigChange('recurringType', RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE) : undefined}
                >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '16px !important' }}>
                        <Box display="flex" alignItems="center">
                            <TextField
                                type="number"
                                value={suggestionsConfig.daysSinceLastOccurrence}
                                onChange={(e) => handleConfigChange("daysSinceLastOccurrence", Number(e.target.value))}
                                size="small"
                                sx={{
                                    width: '60px',
                                    marginRight: 1,
                                    textAlign: 'center',
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: isDaysSince ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                        },
                                        '&:hover fieldset': {
                                            borderColor: isDaysSince ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: isDaysSince ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center',
                                        color: isDaysSince ? theme.palette.custom.cardTextSelected : theme.palette.grey[600],
                                    },
                                }}
                                slotProps={{
                                    htmlInput: {
                                        sx: {
                                            pr: '2px'
                                        }
                                    }
                                }}
                            />
                            <Typography variant="body1" sx={{ color: isDaysSince ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>
                                days since last time
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
                <Card
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: isSpecificDays ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                        boxShadow: 3,
                        backgroundColor: isSpecificDays ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                    }}
                    onClick={!isSpecificDays ? () => handleConfigChange('recurringType', RECURRING_TYPES.SPECIFIC_DAYS) : undefined}
                >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '16px !important' }}>
                        <Box display="flex" alignItems="center">
                            <Typography variant="body1" sx={{ color: isSpecificDays ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>
                                Every
                            </Typography>
                            <Select
                                value={suggestionsConfig.specificDays}
                                onChange={(e) => handleConfigChange("specificDays", e.target.value)}
                                size="small"
                                sx={{
                                    width: 'fit-content',
                                    marginLeft: 1,
                                    '& fieldset': {
                                        borderColor: isSpecificDays ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                    },
                                    '&:hover fieldset': {
                                        borderColor: isSpecificDays ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: isSpecificDays ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                    },
                                    '& .MuiInputBase-input': {
                                        color: isSpecificDays ? theme.palette.custom.cardTextSelected : theme.palette.grey[600],
                                    },
                                }}
                                MenuProps={{
                                    disablePortal: true,
                                    sx: {
                                        maxHeight: 350,
                                    },
                                }}
                            >
                                {specificDaysOptions.map((day) => (
                                    <MenuItem key={day} value={day}>
                                        {formatSpecificDays(day)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box >
    );
};
