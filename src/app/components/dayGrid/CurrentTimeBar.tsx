import { Box } from "@mui/material";
import { daytimeHours, HOUR_COLUMN_WIDTH } from "./consts";

interface CurrentTimeBarProps {
    nowMinuteOfDay: number;
}

const CurrentTimeBar: React.FC<CurrentTimeBarProps> = ({ nowMinuteOfDay }) => {
    return (
        <Box
            sx={{
                position: "absolute",
                top: `CALC(1px + ${(((nowMinuteOfDay - (daytimeHours[0] * 60)) / (daytimeHours.length * 60)) * 100)}%)`,
                height: "1px",
                left: HOUR_COLUMN_WIDTH + 8,
                right: 0,
                backgroundColor: 'hsl(187, 80%, 75%)',
                ":before": {
                    content: '""',
                    position: "absolute",
                    top: "-4px",
                    left: "-4px",
                    width: "8px",
                    height: "8px",
                    backgroundColor: 'hsl(187, 80%, 75%)',
                    borderRadius: "50%",
                },
                pointerEvents: "none",
            }}
        />
    );
};

export default CurrentTimeBar;
