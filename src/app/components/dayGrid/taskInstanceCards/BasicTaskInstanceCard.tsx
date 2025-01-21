import { Box, Typography, useTheme } from "@mui/material";
import { daytimeHours, HOUR_COLUMN_WIDTH } from "../consts";
import { forwardRef, TouchEventHandler } from "react";


const BasicTaskInstanceCard = forwardRef(({
    taskId,
    title,
    start,
    duration,
    hourBlockHeight,
    isThisTaskDetailsOpen,
    handleClick,
    sx,
    onMouseDown,
    onTouchStart,
    absoluteChildren,
}: {
    taskId?: string,
    title: string,
    start: { hour: number, minute: number },
    duration: number,
    hourBlockHeight: number,
    isThisTaskDetailsOpen: boolean,
    handleClick?: () => void,
    sx?: object,
    onMouseDown?: (event: React.MouseEvent) => void,
    absoluteChildren?: React.ReactNode,
    onTouchStart?: TouchEventHandler<HTMLDivElement>,
}, ref) => {
    const theme = useTheme();

    return (
        <Box
            ref={ref}
            sx={{
                position: "absolute",
                top: `CALC(1px + ${(((start.hour - daytimeHours[0]) * 60 + start.minute) / (daytimeHours.length * 60)) * 100}%)`,
                height: `${hourBlockHeight * duration / 60 - 1}px`,
                left: HOUR_COLUMN_WIDTH + 16,
                right: 16,
                backgroundColor: isThisTaskDetailsOpen ? "rgba(4, 70, 190, 0.9)" : "rgba(53, 61, 209, 0.68)",
                borderRadius: "4px",
                padding: duration === 15 ? "1px 4px" : "4px",
                boxSizing: "border-box",
                boxShadow: isThisTaskDetailsOpen ? "2px 2px 10px 1px rgba(123, 158, 206, 0.9)" : "",
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                ...sx,
            }}
            onClick={handleClick}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            id={taskId ? `task-instance-calendar-card-${taskId}` : 'new-task-instance-calendar-card'}
        >
            <Typography variant="body2" color="primary" sx={{
                fontSize: '0.8rem',
                lineHeight: '1',
                color: theme.palette.primary.contrastText,
            }}>{title}</Typography>
            {absoluteChildren}
        </Box>
    );
});

export default BasicTaskInstanceCard;
