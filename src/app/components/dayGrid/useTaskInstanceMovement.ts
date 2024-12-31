import { useEffect, useState } from "react";
import { TaskInstance, MoveType } from "./types";
import { moveTaskInstance, stopMovingTaskInstance } from "./taskInstanceHandlers";

export const useTaskInstanceMovement = (taskInstances: TaskInstance[] | undefined, updateTaskInstance: any) => {
    const [movingTaskInfo, setMovingTaskInfo] = useState<{
        taskInstance: TaskInstance,
        moveType: MoveType,
        cursorMinutesFromStart?: number,
        hasChanged?: boolean,
        isSubmitting?: boolean,
    } | null>(null);

    const startMovingTaskInstance = (taskInstance: TaskInstance, event: React.MouseEvent, moveType: MoveType) => {
        setMovingTaskInfo({ taskInstance, moveType });
        document.body.style.userSelect = "none";
        event.stopPropagation();
    };

    useEffect(() => {
        if (movingTaskInfo) {
            const handleMouseMove = (event: MouseEvent) => moveTaskInstance(event, movingTaskInfo, setMovingTaskInfo, taskInstances);
            const handleMouseUp = () => stopMovingTaskInstance(movingTaskInfo, setMovingTaskInfo, updateTaskInstance);

            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);

            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [movingTaskInfo, taskInstances, updateTaskInstance]);

    return { movingTaskInfo, startMovingTaskInstance, setMovingTaskInfo };
};
