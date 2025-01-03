import { Box, useTheme } from "@mui/material";
import { daytimeHours, HOUR_COLUMN_WIDTH } from "./consts";

interface HourGridProps {
    addDraftTaskInstance: ({ startHour, startMinute }: { startHour: number, startMinute: number }) => void;
    hourBlockHeight: number;
}

const HourGrid: React.FC<HourGridProps> = ({ addDraftTaskInstance, hourBlockHeight }) => {
    const theme = useTheme();

    return (
        <>
            {daytimeHours.map((hour) => (
                <Box key={hour} sx={{ display: 'flex', height: hourBlockHeight }}>
                    <Box sx={{ width: HOUR_COLUMN_WIDTH, marginTop: '-12px', textAlign: 'right', mr: 1 }}>
                        {hour}:00
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            flexGrow: 1,
                            borderTop: `1px solid ${theme.palette.grey[200]}`,
                            position: "relative",
                        }}
                    >
                        {[0, 15, 30, 45].map((quarter) => (
                            <Box
                                key={quarter}
                                sx={{ flex: 1 }}
                                onClick={() => {
                                    addDraftTaskInstance({ startHour: hour, startMinute: quarter })
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            ))}
        </>
    );
};

export default HourGrid;
