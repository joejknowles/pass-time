import { TouchEvent, useEffect, useRef, useState } from "react";
import { TaskInstance, MoveType, DraftTaskInstance, Task, MovingTaskInfo } from "./types";
import { moveTaskInstance, stopMovingTaskInstance } from "./taskInstanceHandlers";
import { DraggedTask } from "../tasksList/types";
import { HOUR_COLUMN_WIDTH } from "./consts";
import { getTimeFromCursor } from "./utils";

export interface TaskInstanceMovement {
    movingTaskInfo: MovingTaskInfo | null;
    startMovingTaskInstance: (taskInstance: TaskInstance, moveType: string) => void;
    hasDraggedForABit: boolean;
    taskInstanceInTouchEditMode: string | null;
    setTaskInstanceInTouchEditMode: React.Dispatch<React.SetStateAction<string | null>>;
    handleTouchStartOnInstance: (event: TouchEvent<HTMLDivElement>, taskInstance: TaskInstance) => void;
}

export const useTaskInstanceMovement = (
    taskInstances: TaskInstance[] | undefined,
    updateTaskInstance: any,
    draftTaskInstance: DraftTaskInstance | null,
    updateDraftTaskInstance: any,
    finalizeDraftTaskInstance: any,
    draggedTask: DraggedTask | null,
    setDraggedTask: React.Dispatch<React.SetStateAction<DraggedTask | null>>,
    setDraftTaskInstance: React.Dispatch<React.SetStateAction<DraftTaskInstance | null>>,
    daytimeHours: number[],
    entityDetailsPanelOpen: boolean,
): TaskInstanceMovement => {
    const [movingTaskInfo, setMovingTaskInfo] = useState<MovingTaskInfo | null>(null);
    const [taskInstanceInTouchEditMode, setTaskInstanceInTouchEditMode] = useState<string | null>(null);
    const [hasDraggedForABit, setHasDraggedForABit] = useState(false);
    const touchEditModeTimerInProgress = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (draggedTask?.task.id) {
            if (!hasDraggedForABit) {
                const timeout = setTimeout(() => {
                    setHasDraggedForABit(true);
                }, 200);
                return () => clearTimeout(timeout);
            }
        } else if (hasDraggedForABit) {
            setHasDraggedForABit(false);
        }
    }, [draggedTask?.task.id]);

    useEffect(() => {
        if (entityDetailsPanelOpen) {
            setTaskInstanceInTouchEditMode(null);
        }
    }, [entityDetailsPanelOpen]);

    const startMovingTaskInstance = (taskInstance: TaskInstance, moveType: string) => {
        setMovingTaskInfo({ taskInstance, moveType: moveType as MoveType, isSameAsInitial: true, hasChanged: false });
        document.body.style.userSelect = "none";
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (movingTaskInfo) {
            moveTaskInstance(event, movingTaskInfo, setMovingTaskInfo, taskInstances);
        } else if (draftTaskInstance && draggedTask) {
            const { startHour, startMinute } = getTimeFromCursor(event.clientY, draftTaskInstance.duration, daytimeHours);
            updateDraftTaskInstance({ startHour, startMinute, task: draggedTask.task });
        }

        if (draggedTask) {
            setDraggedTask(draggedTask => draggedTask ? ({
                ...draggedTask,
                position: { x: event.clientX, y: event.clientY }
            }) : null);
            const gridRect = document.getElementById("day-grid-container")!.getBoundingClientRect();
            const isPastLeftSide = event.clientX > (HOUR_COLUMN_WIDTH + gridRect.left + 10);
            const isOverDayGrid = event.clientY > gridRect.top &&
                event.clientY < gridRect.bottom &&
                event.clientX < (gridRect.right - 10) &&
                isPastLeftSide;
            if (!draftTaskInstance && isOverDayGrid) {
                const { startHour, startMinute } = getTimeFromCursor(event.clientY, draggedTask.task.defaultDuration, daytimeHours);
                updateDraftTaskInstance({ startHour, startMinute, task: draggedTask.task as Task });
            } else if (draftTaskInstance && !isOverDayGrid) {
                setDraftTaskInstance(null);
            }
        }
    };

    const handleMouseUp = () => {
        if (movingTaskInfo) {
            stopMovingTaskInstance(movingTaskInfo, setMovingTaskInfo, updateTaskInstance);
        } else if (draftTaskInstance && draggedTask) {
            finalizeDraftTaskInstance();
        } else if (draggedTask && !draftTaskInstance) {
            setDraggedTask(null);
            document.body.style.userSelect = ''; // Re-enable text selection
        }
    };

    const handleTouchStartOnInstance = (event: TouchEvent, taskInstance: TaskInstance) => {
        touchEditModeTimerInProgress.current = setTimeout(() => {
            setTaskInstanceInTouchEditMode(taskInstance.id);
            touchEditModeTimerInProgress.current = null;
        }, 500);
    }

    const handleTouchEnd = () => {
        if (touchEditModeTimerInProgress.current) {
            clearTimeout(touchEditModeTimerInProgress.current);
        }
    };

    const handleTouchMove: EventListener = (event) => {
        if (taskInstanceInTouchEditMode) {
            event.preventDefault();
        }
        if (touchEditModeTimerInProgress.current) {
            clearTimeout(touchEditModeTimerInProgress.current);
        }
    }

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("touchend", handleTouchEnd);
        window.addEventListener("touchmove", handleTouchMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchend", handleTouchEnd);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, [movingTaskInfo, draftTaskInstance, draggedTask, taskInstances, updateTaskInstance]);

    return {
        movingTaskInfo,
        startMovingTaskInstance,
        hasDraggedForABit,
        taskInstanceInTouchEditMode,
        setTaskInstanceInTouchEditMode,
        handleTouchStartOnInstance
    };
};
