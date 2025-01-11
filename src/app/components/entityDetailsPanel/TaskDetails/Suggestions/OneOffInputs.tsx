import { Box, Card, CardContent, Typography, TextField, useTheme } from "@mui/material";
import { TaskSuggestionsConfig } from "./types";

interface OneOffInputsProps {
    suggestionsConfig: TaskSuggestionsConfig;
    handleConfigChange: (newValues: Partial<TaskSuggestionsConfig>) => void;
}

export const OneOffInputs: React.FC<OneOffInputsProps> = ({ suggestionsConfig, handleConfigChange }) => {
    const theme = useTheme();

    return (
        <Box mt={3}>
            <Box component="hr" sx={{ borderTop: theme.palette.grey[300], marginBottom: 3 }} />
            <Box display="flex" flexDirection="column" gap={3}>
                <Box display="flex" alignItems="center">
                    <TextField
                        label="Date"
                        type="date"
                        value={suggestionsConfig.oneOffDate}
                        onChange={(e) => handleConfigChange({
                            oneOffDate: e.target.value,
                            recurringOrOnce: "ONE_OFF"
                        })}
                        size="small"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            }
                        }}
                    />
                </Box>

                <Box component="hr" sx={{ borderTop: theme.palette.grey[300] }} />
                <Card
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: suggestionsConfig.oneOffDateType === "BEFORE_OR_ON" ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                        boxShadow: 3,
                        backgroundColor: suggestionsConfig.oneOffDateType === "BEFORE_OR_ON" ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                    }}
                    onClick={suggestionsConfig.oneOffDateType !== "BEFORE_OR_ON" ? () => handleConfigChange({ oneOffDateType: "BEFORE_OR_ON" }) : undefined}
                >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '16px !important' }}>
                        <Typography variant="body1" sx={{ color: suggestionsConfig.oneOffDateType === "BEFORE_OR_ON" ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>
                            Any time up to {suggestionsConfig.oneOffDate}
                        </Typography>
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
                        border: suggestionsConfig.oneOffDateType === "ON_DATE_ONLY" ? `1px solid ${theme.palette.custom.cardBorderSelected}` : `1px solid ${theme.palette.grey[300]}`,
                        boxShadow: 3,
                        backgroundColor: suggestionsConfig.oneOffDateType === "ON_DATE_ONLY" ? theme.palette.custom.cardBackgroundSelected : theme.palette.custom.white
                    }}
                    onClick={suggestionsConfig.oneOffDateType !== "ON_DATE_ONLY" ? () => handleConfigChange({ oneOffDateType: "ON_DATE_ONLY" }) : undefined}
                >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '16px !important' }}>
                        <Typography variant="body1" sx={{ color: suggestionsConfig.oneOffDateType === "ON_DATE_ONLY" ? theme.palette.custom.cardTextSelected : theme.palette.grey[600] }}>
                            Only on {suggestionsConfig.oneOffDate}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};
