import { Box, Typography, FormControlLabel, Switch, Card, CardContent } from "@mui/material";
import { useState } from "react";
import EventIcon from '@mui/icons-material/Event';
import RepeatIcon from '@mui/icons-material/Repeat';

export const TaskDetailsSuggestions = () => {
    const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
    const [suggestionsConfig, setSuggestionsConfig] = useState({ taskType: "RECURRING" });

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
                                border: suggestionsConfig.taskType === "RECURRING" ? '1px solid #64b5f6' : '1px solid lightgrey',
                                boxShadow: 3,
                                backgroundColor: suggestionsConfig.taskType === "RECURRING" ? '#e3f2fd' : 'white'
                            }}
                            onClick={() => setSuggestionsConfig({ ...suggestionsConfig, taskType: "RECURRING" })}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '8px !important' }}>
                                <RepeatIcon fontSize="large" sx={{ color: suggestionsConfig.taskType === "RECURRING" ? '#1976d2' : 'grey' }} />
                                <Typography variant="caption" sx={{ color: suggestionsConfig.taskType === "RECURRING" ? '#1976d2' : 'black' }}>Recurring</Typography>
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
                                border: suggestionsConfig.taskType === "ONE_OFF" ? '1px solid #64b5f6' : '1px solid lightgrey',
                                boxShadow: 3,
                                backgroundColor: suggestionsConfig.taskType === "ONE_OFF" ? '#e3f2fd' : 'white'
                            }}
                            onClick={() => setSuggestionsConfig({ ...suggestionsConfig, taskType: "ONE_OFF" })}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '8px !important' }}>
                                <EventIcon fontSize="large" sx={{ color: suggestionsConfig.taskType === "ONE_OFF" ? '#1976d2' : 'grey' }} />
                                <Typography variant="caption" sx={{ color: suggestionsConfig.taskType === "ONE_OFF" ? '#1976d2' : 'black' }}>One-off</Typography>
                            </CardContent>
                        </Card>
                    </Box>
                )
            }
        </Box>
    );
};
