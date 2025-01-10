import { Box, Card, CardContent, Typography, TextField, Select, MenuItem, useTheme } from "@mui/material";
import { useEffect } from "react";

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

interface RecurringInputsProps {
    suggestionsConfig: SuggestionsConfig;
    setSuggestionsConfig: (config: SuggestionsConfig) => void;
}

export const RecurringInputs: React.FC<RecurringInputsProps> = ({ suggestionsConfig, setSuggestionsConfig }) => {
    const theme = useTheme();

    useEffect(() => {
        if (!suggestionsConfig.recurringType) {
            setSuggestionsConfig({ ...suggestionsConfig, recurringType: RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE });
        }
    }, [suggestionsConfig, setSuggestionsConfig]);

    const handleInputChange = (field: keyof SuggestionsConfig, value: any) => {
        setSuggestionsConfig({ ...suggestionsConfig, [field]: value });
    };

    return (
        <Box mt={2}>
            <Box component="hr" sx={{ borderColor: theme.palette.grey[300], marginBottom: 2 }} />
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
                    onClick={() => setSuggestionsConfig({ ...suggestionsConfig, recurringType: RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE })}
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
                    onClick={() => setSuggestionsConfig({ ...suggestionsConfig, recurringType: RECURRING_TYPES.SPECIFIC_DAY })}
                >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '16px !important' }}>
                        <Box display="flex" alignItems="center">
                            <Typography variant="body1" sx={{ color: suggestionsConfig.recurringType === RECURRING_TYPES.SPECIFIC_DAY ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>
                                Every
                            </Typography>
                            <Select
                                value={suggestionsConfig.specificDay}
                                onChange={(e) => handleInputChange("specificDay", e.target.value)}
                                size="small"
                                sx={{
                                    width: '120px',
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
        </Box>
    );
};
