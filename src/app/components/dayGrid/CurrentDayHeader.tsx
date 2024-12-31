import { Box, Button, Typography } from "@mui/material";
import { isToday } from "./utils";

const CurrentDayHeader = ({ currentDay, updateCurrentDay }: {
    currentDay: Date,
    updateCurrentDay: (day: Date) => void,
}) => {
    const isViewingToday = isToday(currentDay);
    const dayOfWeek = currentDay.toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button onClick={() => updateCurrentDay(new Date(currentDay.getTime() - 24 * 60 * 60 * 1000))}>{"<"}</Button>
            <Typography variant="body2">{isViewingToday ? `Today (${dayOfWeek})` : dayOfWeek}</Typography>
            <Button onClick={() => updateCurrentDay(new Date(currentDay.getTime() + 24 * 60 * 60 * 1000))}>{">"}</Button>
        </Box>
    );
};

export default CurrentDayHeader;
