import { useEffect, useState } from "react";
import { TaskInstance, MoveType, DraftTaskInstance, Task, MovingTaskInfo } from "./types";
import { moveTaskInstance, stopMovingTaskInstance } from "./taskInstanceHandlers";
import { BasicTask } from "../tasksList/types";

export const useTaskInstanceMovement = (
    taskInstances: TaskInstance[] | undefined,
    updateTaskInstance: any,
    draftTaskInstance: DraftTaskInstance | null,
    updateDraftTaskInstance: any,
    finalizeDraftTaskInstance: any,
    getTimeFromCursor: (clientY: number) => { startHour: number, startMinute: number },
    draggedTask: { task:  Task | BasicTask, position: { x: number, y: number }, width: number } | null
) => {
    const [movingTaskInfo, setMovingTaskInfo] = useState<MovingTaskInfo | null>(null);

    const startMovingTaskInstance = (taskInstance: TaskInstance, moveType: string) => {
        setMovingTaskInfo({ taskInstance, moveType: moveType as MoveType });
        document.body.style.userSelect = "none";
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (movingTaskInfo) {
            moveTaskInstance(event, movingTaskInfo, setMovingTaskInfo, taskInstances);
        } else if (draftTaskInstance && draggedTask) {
            const { startHour, startMinute } = getTimeFromCursor(event.clientY);
            updateDraftTaskInstance({ startHour, startMinute, task: draggedTask.task });
        }
    };

    const handleMouseUp = () => {
        if (movingTaskInfo) {
            stopMovingTaskInstance(movingTaskInfo, setMovingTaskInfo, updateTaskInstance);
        } else if (draftTaskInstance && draggedTask) {
            finalizeDraftTaskInstance();
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
