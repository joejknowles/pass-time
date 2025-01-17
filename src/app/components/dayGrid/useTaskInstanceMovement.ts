import { useEffect, useState } from "react";
import { TaskInstance, MoveType, DraftTaskInstance, Task, MovingTaskInfo } from "./types";
import { moveTaskInstance, stopMovingTaskInstance } from "./taskInstanceHandlers";
import { BasicTask } from "../tasksList/types";
import { HOUR_COLUMN_WIDTH } from "./consts";

export const useTaskInstanceMovement = (
    taskInstances: TaskInstance[] | undefined,
    updateTaskInstance: any,
    draftTaskInstance: DraftTaskInstance | null,
    updateDraftTaskInstance: any,
    finalizeDraftTaskInstance: any,
    getTimeFromCursor: (clientY: number) => { startHour: number, startMinute: number },
    draggedTask: { task: Task | BasicTask, position: { x: number, y: number }, width: number } | null,
    setDraggedTask: React.Dispatch<React.SetStateAction<{ task: Task | BasicTask, position: { x: number, y: number }, width: number } | null>>,
    setDraftTaskInstance: React.Dispatch<React.SetStateAction<DraftTaskInstance | null>>
) => {
    const [movingTaskInfo, setMovingTaskInfo] = useState<MovingTaskInfo | null>(null);

    const startMovingTaskInstance = (taskInstance: TaskInstance, moveType: string) => {
        setMovingTaskInfo({ taskInstance, moveType: moveType as MoveType, isSameAsInitial: true, hasChanged: false });
        document.body.style.userSelect = "none";
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (movingTaskInfo) {
            moveTaskInstance(event, movingTaskInfo, setMovingTaskInfo, taskInstances);
        } else if (draftTaskInstance && draggedTask) {
            const { startHour, startMinute } = getTimeFromCursor(event.clientY);
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
                const { startHour, startMinute } = getTimeFromCursor(event.clientY);
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

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [movingTaskInfo, draftTaskInstance, draggedTask, taskInstances, updateTaskInstance]);

    return { movingTaskInfo, startMovingTaskInstance, setMovingTaskInfo };
};
