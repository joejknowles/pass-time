import { Box, Card, CardContent, Typography, TextField, Select, MenuItem, useTheme } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { RECURRING_TYPES, TaskSuggestionsConfig } from "./types";

interface RecurringInputsProps {
    suggestionsConfig: TaskSuggestionsConfig;
    setSuggestionsConfig: Dispatch<SetStateAction<TaskSuggestionsConfig>>;
}

export const RecurringInputs: React.FC<RecurringInputsProps> = ({ suggestionsConfig, setSuggestionsConfig }) => {
    const theme = useTheme();

    const handleInputChange = (field: keyof TaskSuggestionsConfig, value: any) => {
        setSuggestionsConfig(suggestionsConfig => ({ ...suggestionsConfig, [field]: value }));
    };

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
                        border: suggestionsConfig.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                        boxShadow: 3,
                        backgroundColor: suggestionsConfig.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                    }}
                    onClick={() => setSuggestionsConfig(suggestionsConfig => ({ ...suggestionsConfig, recurringType: RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE }))}
                >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '16px !important' }}>
                        <Box display="flex" alignItems="center">
                            <TextField
                                type="number"
                                value={suggestionsConfig.daysSinceLastOccurrence}
                                onChange={(e) => handleInputChange("daysSinceLastOccurrence", Number(e.target.value))}
                                size="small"
                                sx={{
                                    width: '60px',
                                    marginRight: 1,
                                    textAlign: 'center',
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: suggestionsConfig.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                        },
                                        '&:hover fieldset': {
                                            borderColor: suggestionsConfig.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: suggestionsConfig.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center',
                                        color: suggestionsConfig.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE ? theme.palette.custom.cardTextSelected : theme.palette.grey[600],
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
                            <Typography variant="body1" sx={{ color: suggestionsConfig.recurringType === RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>
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
                        border: suggestionsConfig.recurringType === RECURRING_TYPES.SPECIFIC_DAY ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                        boxShadow: 3,
                        backgroundColor: suggestionsConfig.recurringType === RECURRING_TYPES.SPECIFIC_DAY ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                    }}
                    onClick={() => setSuggestionsConfig(suggestionsConfig => ({ ...suggestionsConfig, recurringType: RECURRING_TYPES.SPECIFIC_DAY }))}
                >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '16px !important' }}>
                        <Box display="flex" alignItems="center">
                            <Typography variant="body1" sx={{ color: suggestionsConfig.recurringType === RECURRING_TYPES.SPECIFIC_DAY ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>
                                Every
                            </Typography>
                            <Select
                                value={suggestionsConfig.specificDay}
                                onChange={(e) => {
                                    console.log
                                    handleInputChange("specificDay", e.target.value)
                                }}
                                size="small"
                                sx={{
                                    width: 'fit-content',
                                    marginLeft: 1,
                                    '& fieldset': {
                                        borderColor: suggestionsConfig.recurringType === RECURRING_TYPES.SPECIFIC_DAY ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                    },
                                    '&:hover fieldset': {
                                        borderColor: suggestionsConfig.recurringType === RECURRING_TYPES.SPECIFIC_DAY ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: suggestionsConfig.recurringType === RECURRING_TYPES.SPECIFIC_DAY ? theme.palette.custom.cardInputBorderSelected : theme.palette.grey[400],
                                    },
                                    '& .MuiInputBase-input': {
                                        color: suggestionsConfig.recurringType === RECURRING_TYPES.SPECIFIC_DAY ? theme.palette.custom.cardTextSelected : theme.palette.grey[600],
                                    },
                                }}
                                MenuProps={{
                                    disablePortal: true,
                                    sx: {
                                        maxHeight: 350,
                                    },
                                }}
                            >
                                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                                    <MenuItem key={day} value={day}>
                                        {day}
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
