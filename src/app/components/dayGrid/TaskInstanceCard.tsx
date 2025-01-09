import { Box } from "@mui/material";
import { MoveType, TaskInstance } from "./types";
import BasicTaskInstanceCard from "./BasicTaskInstanceCard";

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

    const cursor = movingTaskInfo ?
        movingTaskInfo.moveType === "both" ? "grabbing" : 'ns-resize'
        : 'pointer';

    const handleCursor = movingTaskInfo?.moveType === "both" ? "grabbing" : 'ns-resize';

    return (
        <BasicTaskInstanceCard
            taskId={taskInstance.id}
            title={taskInstance.task.title}
            start={effectiveStart}
            duration={effectiveDuration}
            hourBlockHeight={hourBlockHeight}
            isThisTaskDetailsOpen={isThisTaskDetailsOpen}
            handleClick={handleClick}
            sx={{ cursor }}
            onMouseDown={(e) => startMovingTaskInstance(taskInstance, e, "both")}
            absoluteChildren={
                <>
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: effectiveDuration === 15 ? "3px" : "5px",
                            cursor: handleCursor,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                        }}
                        onMouseDown={(e) => startMovingTaskInstance(taskInstance, e, "start")}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: effectiveDuration === 15 ? "3px" : "5px",
                            cursor: handleCursor,
                        }}
                        onMouseDown={(e) => startMovingTaskInstance(taskInstance, e, "end")}
                    />
                </>
            }
        />
    );
};

export default TaskInstanceCard;
