import { TaskInstance, MoveType, MovingTaskInfo } from "./types";
import { daytimeHours } from "./consts";

export const moveTaskInstance = (
    event: MouseEvent,
    movingTaskInfo: MovingTaskInfo | null,
    setMovingTaskInfo: React.Dispatch<React.SetStateAction<MovingTaskInfo | null>>,
    taskInstances: TaskInstance[] | undefined
) => {
    if (movingTaskInfo && !movingTaskInfo.isSubmitting) {
        const movingTaskInstance = movingTaskInfo.taskInstance;
        const originalTaskInstance = taskInstances?.find(taskInstance => taskInstance.id === movingTaskInstance.id) as TaskInstance;

        const gridOffsetTop = document.querySelector("#day-grid-container")?.getBoundingClientRect().top || 0;
        const containerHeight = (document.querySelector("#day-grid-container")?.clientHeight || 1);
        const yPosition = event.clientY - gridOffsetTop;
        const THRESHOLD_OFFSET = 3;
        const cursorMinutesFromDaytimeStart = Math.floor(((yPosition + THRESHOLD_OFFSET) / containerHeight) * daytimeHours.length * 60 / 15) * 15;
        const preciseCursorMinutesFromDaytimeStart = ((yPosition + THRESHOLD_OFFSET) / containerHeight) * daytimeHours.length * 60;

        const taskInstanceStart = movingTaskInstance.start;
        const taskInstanceMinutesFromDaytimeStart = taskInstanceStart.hour * 60 + taskInstanceStart.minute - daytimeHours[0] * 60;
        if (movingTaskInfo?.moveType === "end") {

            const newDuration = Math.max(cursorMinutesFromDaytimeStart - taskInstanceMinutesFromDaytimeStart, 15);

            setMovingTaskInfo({
                moveType: movingTaskInfo.moveType,
                taskInstance: { ...movingTaskInstance, duration: newDuration },
                hasChanged: movingTaskInfo.hasChanged ||
                    newDuration !== movingTaskInstance.duration,
                isSameAsInitial: newDuration === originalTaskInstance.duration,
            });
        } else if (movingTaskInfo?.moveType === "start" || movingTaskInfo?.moveType === "both") {
            let startMinutesFromDaytimeStart = cursorMinutesFromDaytimeStart;
            if (movingTaskInfo.moveType === "both") {
                if (!movingTaskInfo.cursorMinutesFromStart) {
                    movingTaskInfo.cursorMinutesFromStart = preciseCursorMinutesFromDaytimeStart - taskInstanceMinutesFromDaytimeStart;
                    setMovingTaskInfo({
                        ...movingTaskInfo,
                    });
                }
                startMinutesFromDaytimeStart = Math.floor((preciseCursorMinutesFromDaytimeStart - movingTaskInfo.cursorMinutesFromStart) / 15) * 15;
            }
            const minutesFromDayStart = daytimeHours[0] * 60 + startMinutesFromDaytimeStart;
            const newStartHour = Math.floor(minutesFromDayStart / 60);
            const newStartMinute = minutesFromDayStart % 60;

            const updatedDuration = Math.max(
                movingTaskInfo?.moveType === "both" ?
                    originalTaskInstance.duration :
                    originalTaskInstance.start.hour * 60 +
                    originalTaskInstance.start.minute +
                    originalTaskInstance.duration -
                    minutesFromDayStart,
                15);

            setMovingTaskInfo(state => state ? ({
                ...state,
                taskInstance: {
                    ...state.taskInstance,
                    duration: updatedDuration,
                    start: {
                        ...state.taskInstance.start,
                        hour: newStartHour,
                        minute: newStartMinute,
                    }
                },
                hasChanged: movingTaskInfo.hasChanged ||
                    (updatedDuration !== movingTaskInstance.duration ||
                        newStartHour !== movingTaskInstance.start.hour ||
                        newStartMinute !== movingTaskInstance.start.minute
                    ),
                isSameAsInitial: updatedDuration === originalTaskInstance.duration &&
                    newStartHour === originalTaskInstance.start.hour &&
                    newStartMinute === originalTaskInstance.start.minute,
            }) : state);

        }
    }
};

export const stopMovingTaskInstance = async (
    movingTaskInfo: MovingTaskInfo | null,
    setMovingTaskInfo: React.Dispatch<
        React.SetStateAction<MovingTaskInfo | null>
    >,
    updateTaskInstance: any
) => {
    document.body.style.userSelect = "";

    if (movingTaskInfo && !movingTaskInfo.isSameAsInitial) {
        const { taskInstance, moveType } = movingTaskInfo;
        setMovingTaskInfo({ ...movingTaskInfo, isSubmitting: true });
        await updateTaskInstance({
            variables: {
                input: {
                    id: taskInstance.id,
                    ...(
                        moveType !== "both" ? {
                            duration: taskInstance.duration,
                        } : null
                    ),
                    ...(
                        moveType !== "end" ? {
                            start: {
                                date: taskInstance.start.date,
                                hour: taskInstance.start.hour,
                                minute: taskInstance.start.minute,
                            }
                        } : null
                    )
                },
            },
        });
    }

    setTimeout(() => setMovingTaskInfo(null), 100);
};
