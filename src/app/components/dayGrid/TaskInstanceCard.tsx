import { Box, Typography, useTheme } from "@mui/material";
import { daytimeHours, HOUR_COLUMN_WIDTH } from "./consts";
import { MoveType, TaskInstance } from "./types";

const TaskInstanceCard = ({
    taskInstance,
    effectiveStart,
    effectiveDuration,
    movingTaskInfo,
    startMovingTaskInstance,
    isThisTaskDetailsOpen,
    handleClick,
    hourBlockHeight,
}: {
    taskInstance: TaskInstance,
    effectiveStart: { hour: number, minute: number },
    effectiveDuration: number,
    movingTaskInfo: any,
    startMovingTaskInstance: (taskInstance: TaskInstance, event: React.MouseEvent, moveType: MoveType) => void,
    isThisTaskDetailsOpen: boolean,
    handleClick: () => void,
    hourBlockHeight: number,
}) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: "absolute",
                top: `CALC(1px + ${(((effectiveStart.hour - daytimeHours[0]) * 60 + effectiveStart.minute) / (daytimeHours.length * 60)) * 100}%)`,
                height: `${hourBlockHeight * effectiveDuration / 60 - 1}px`,
                left: HOUR_COLUMN_WIDTH + 16,
                right: 16,
                backgroundColor: isThisTaskDetailsOpen ? "rgba(4, 70, 190, 0.9)" : "rgba(53, 61, 209, 0.68)",
                borderRadius: "4px",
                padding: effectiveDuration === 15 ? "1px 4px" : "4px",
                boxSizing: "border-box",
                cursor: movingTaskInfo ?
                    movingTaskInfo.moveType === "both" ? "grabbing" : 'ns-resize'
                    : 'pointer',
                boxShadow: isThisTaskDetailsOpen ? "2px 2px 10px 1px rgba(123, 158, 206, 0.9)" : "",
            }}
            onClick={handleClick}
            onMouseDown={(e) => startMovingTaskInstance(taskInstance, e, "both")}
            id={`task-instance-calendar-card-${taskInstance.id}`}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: effectiveDuration === 15 ? "3px" : "5px",
                    cursor:
                        movingTaskInfo?.moveType === "both" ? "grabbing" : 'ns-resize',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                }}
                onMouseDown={(e) => startMovingTaskInstance(taskInstance, e, "start")}
            >
            </Box>
            <Typography variant="body2" color="primary" sx={{
                fontSize: '0.8rem',
                lineHeight: '1',
                color: theme.palette.primary.contrastText,
            }}>{taskInstance.task.title}</Typography>
            <Box
                sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: effectiveDuration === 15 ? "3px" : "5px",
                    cursor:
                        movingTaskInfo?.moveType === "both" ? "grabbing" : 'ns-resize',
                }}
                onMouseDown={(e) => startMovingTaskInstance(taskInstance, e, "end")}
            />
        </Box>

    );
};

export default TaskInstanceCard;
