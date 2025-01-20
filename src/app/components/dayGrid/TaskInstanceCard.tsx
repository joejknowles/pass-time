import { Box, ClickAwayListener } from "@mui/material";
import { MoveType, MovingTaskInfo, TaskInstance } from "./types";
import BasicTaskInstanceCard from "./BasicTaskInstanceCard";
import { TaskInstanceMovement } from "./useTaskInstanceMovement";
import { useEffect, useRef } from "react";

const TaskInstanceCard = ({
    taskInstance,
    effectiveStart,
    effectiveDuration,
    movingTaskInfo,
    startMovingTaskInstance,
    isThisTaskDetailsOpen,
    handleClick,
    hourBlockHeight,
    taskInstanceMovement
}: {
    taskInstance: TaskInstance,
    effectiveStart: { hour: number, minute: number },
    effectiveDuration: number,
    movingTaskInfo: MovingTaskInfo | null,
    startMovingTaskInstance: (taskInstance: TaskInstance, moveType: MoveType) => void,
    isThisTaskDetailsOpen: boolean,
    handleClick: () => void,
    hourBlockHeight: number,
    taskInstanceMovement?: TaskInstanceMovement,
}) => {
    const thisRef = useRef<HTMLDivElement>(null);
    const isThisCardSubmittingChanges = movingTaskInfo?.isSubmitting && movingTaskInfo.taskInstance.id === taskInstance.id;

    let cursor = movingTaskInfo ?
        movingTaskInfo.moveType === "both" ? "grabbing" : 'ns-resize'
        : 'pointer';

    let handleCursor = movingTaskInfo?.moveType === "both" ? "grabbing" : 'ns-resize';

    if (isThisCardSubmittingChanges) {
        cursor = "wait";
        handleCursor = "wait";
    }

    useEffect(() => {
        if (taskInstanceMovement?.taskInstanceInTouchEditMode === taskInstance.id) {
            const handleTouchAway: EventListener = function (event) {
                if (event.target && !thisRef.current?.contains(event.target as Node)) {
                    taskInstanceMovement.setTaskInstanceInTouchEditMode(null);
                }
            }
            document.addEventListener('touchend', handleTouchAway);
            return () => document.removeEventListener('touchend', handleTouchAway);
        }
    }, [taskInstanceMovement?.taskInstanceInTouchEditMode]);

    return (
        <BasicTaskInstanceCard
            ref={thisRef}
            taskId={taskInstance.id}
            title={taskInstance.task.title}
            start={effectiveStart}
            duration={effectiveDuration}
            hourBlockHeight={hourBlockHeight}
            isThisTaskDetailsOpen={isThisTaskDetailsOpen}
            handleClick={handleClick}
            sx={{
                cursor,
                zIndex: isThisTaskDetailsOpen ? 2 : undefined,
                outline: taskInstanceMovement?.taskInstanceInTouchEditMode === taskInstance.id ? "2px solid rgba(0, 0, 0, 0.7)" : undefined,
            }}
            onMouseDown={!isThisCardSubmittingChanges ? (event) => {
                event.stopPropagation();
                startMovingTaskInstance(taskInstance, "both")
            } : undefined}
            onTouchStart={(event) => {
                taskInstanceMovement?.handleTouchStartOnInstance(event, taskInstance)
            }}
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
                        onMouseDown={!isThisCardSubmittingChanges ? (event) => {
                            event.stopPropagation();
                            startMovingTaskInstance(taskInstance, "start")
                        } : undefined}
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
                        onMouseDown={!isThisCardSubmittingChanges ? (event) => {
                            event.stopPropagation(); startMovingTaskInstance(taskInstance, "end")
                        } : undefined}
                    />
                </>
            }
        />
    );
};

export default TaskInstanceCard;
