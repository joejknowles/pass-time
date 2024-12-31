/** @jsxImportSource @emotion/react */
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { CREATE_TASK_INSTANCE, GET_TASK_INSTANCES, GET_TASKS, UPDATE_TASK_INSTANCE } from "../../lib/graphql/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { DraftTaskInstanceCard as DraftTaskInstanceCard } from "./DraftTaskInstanceCard";
import TaskInstanceModal from "../TaskInstanceModal";
import CurrentTimeBar from "./CurrentTimeBar";
import { daytimeHours } from "./consts";
import HourGrid from "./HourGrid";
import CurrentDayHeader from "./CurrentDayHeader";
import TaskInstanceCard from "./TaskInstanceCard";
import { isToday } from "./utils";
import type { DraftTaskInstance, MoveType, Task, TaskInstance } from "./types";

export const DayCalendar = () => {
    const theme = useTheme();

    const [currentDay, setCurrentDay] = useState(new Date(new Date().toDateString()));
    const [nowMinuteOfDay, setNowMinuteOfDay] = useState(new Date().getHours() * 60 + new Date().getMinutes());
    const [draftTaskInstance, setDraftTaskInstance] = useState<DraftTaskInstance | null>(null);
    const [movingTaskInfo, setMovingTaskInfo] = useState<{
        taskInstance: TaskInstance,
        moveType: MoveType,
        cursorMinutesFromStart?: number,
        hasChanged?: boolean,
        isSubmitting?: boolean,
    } | null
    >(null);

    const [openTaskInstanceId, setOpenTaskInstanceId] = useState<string | null>(null);
    const isNarrowScreen = useMediaQuery("(max-width:710px)");

    const [createTaskInstance, { error: errorFromCreatingTaskInstance }] = useMutation(CREATE_TASK_INSTANCE);
    const [updateTaskInstance, { error: errorFromUpdatingTaskInstance }] = useMutation(UPDATE_TASK_INSTANCE);
    const {
        data: taskInstancesData,
        error: errorFromGetTaskInstances,
        refetch: refetchTaskInstances
    } = useQuery<{ taskInstances: TaskInstance[] }>(GET_TASK_INSTANCES, {
        variables: {
            input: {
                date: currentDay.toISOString().split('T')[0],
            },
        },
    });
    const taskInstances = taskInstancesData?.taskInstances;
    const {
        data: taskData,
        error: errorFromGetTasks,
        refetch: refetchTasks
    } = useQuery<{ tasks: Task[] }>(GET_TASKS);
    const tasks = taskData?.tasks;

    const refetchAllTaskData = useCallback(async () => {
        await Promise.all([refetchTaskInstances(), refetchTasks()]);
    }, [refetchTaskInstances, refetchTasks]);

    const startMovingTaskInstance = (taskInstance: TaskInstance, event: React.MouseEvent, moveType: MoveType) => {
        setMovingTaskInfo({ taskInstance, moveType });
        document.body.style.userSelect = "none";
        event.stopPropagation();
    };

    const moveTaskInstance = (event: MouseEvent) => {
        if (movingTaskInfo && !movingTaskInfo.isSubmitting) {
            const gridOffsetTop = document.querySelector("#day-grid-container")?.getBoundingClientRect().top || 0;
            const containerHeight = (document.querySelector("#day-grid-container")?.clientHeight || 1);
            const yPosition = event.clientY - gridOffsetTop;
            const THRESHOLD_OFFSET = 3;
            const cursorMinutesFromDaytimeStart = Math.floor(((yPosition + THRESHOLD_OFFSET) / containerHeight) * daytimeHours.length * 60 / 15) * 15;
            const preciseCursorMinutesFromDaytimeStart = ((yPosition + THRESHOLD_OFFSET) / containerHeight) * daytimeHours.length * 60;
            const movingTaskInstance = movingTaskInfo.taskInstance;

            const taskInstanceStart = movingTaskInstance.start;
            const taskInstanceMinutesFromDaytimeStart = taskInstanceStart.hour * 60 + taskInstanceStart.minute - daytimeHours[0] * 60;
            if (movingTaskInfo?.moveType === "end") {

                const newDuration = Math.max(cursorMinutesFromDaytimeStart - taskInstanceMinutesFromDaytimeStart, 15);

                setMovingTaskInfo({
                    moveType: movingTaskInfo.moveType,
                    taskInstance: { ...movingTaskInstance, duration: newDuration },
                    hasChanged: movingTaskInfo.hasChanged ||
                        newDuration !== movingTaskInstance.duration,
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

                const originalTaskInstance = taskInstances?.find(taskInstance => taskInstance.id === movingTaskInstance.id) as TaskInstance;
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
                        )
                }) : state);

            }
        }
    };

    const stopMovingTaskInstance = async () => {
        document.body.style.userSelect = "";

        if (movingTaskInfo) {
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

        setMovingTaskInfo(null);
    };

    useEffect(() => {
        if (movingTaskInfo) {
            window.addEventListener("mousemove", moveTaskInstance);
            window.addEventListener("mouseup", stopMovingTaskInstance);
        }
        return () => {
            window.removeEventListener("mousemove", moveTaskInstance);
            window.removeEventListener("mouseup", stopMovingTaskInstance);
        };
    }, [movingTaskInfo]);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        const nextMinuteStartsInMs = (60 - new Date().getSeconds()) * 1000;
        const initialTimeout = setTimeout(() => {
            setNowMinuteOfDay(new Date().getHours() * 60 + new Date().getMinutes());

            interval = setInterval(() => {
                setNowMinuteOfDay(new Date().getHours() * 60 + new Date().getMinutes());
            }, 60 * 1000);
        }, nextMinuteStartsInMs);

        return () => {
            clearInterval(interval);
            clearTimeout(initialTimeout);
        };
    }, []);

    const finalizeTaskInstance = useCallback(async (draftTaskInstance: DraftTaskInstance) => {
        await createTaskInstance({
            variables: {
                input: draftTaskInstance,
            },
        })
        await refetchAllTaskData();
        setDraftTaskInstance(null);
    }, [draftTaskInstance])

    const addDraftTaskInstance = ({ startHour, startMinute }: { startHour: number, startMinute: number }) => {
        const newTaskInstance: DraftTaskInstance = {
            title: "",
            start: {
                date: currentDay.toISOString().split('T')[0],
                hour: startHour,
                minute: startMinute,
            },
            duration: 30,
        };
        setDraftTaskInstance(newTaskInstance);
    }

    const isViewingToday = isToday(currentDay);

    const updateCurrentDay = (day: Date) => {
        setCurrentDay(day);
        if (draftTaskInstance) {
            setDraftTaskInstance(dti => dti ? ({
                ...dti,
                start: {
                    ...dti.start,
                    date: day.toISOString().split('T')[0]
                }
            }) : dti);
        }
    }

    const hourBlockHeight = isNarrowScreen ? 60 : 60;
    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            overflowY: 'hidden',
            position: 'relative',
        }}
            id="day-grid-root"
        >
            <CurrentDayHeader
                currentDay={currentDay}
                updateCurrentDay={updateCurrentDay}
            />
            <TaskInstanceModal
                openTaskInstanceId={openTaskInstanceId}
                taskInstances={taskInstances}
                setOpenTaskInstanceId={setOpenTaskInstanceId}
                refetchAllTaskData={refetchAllTaskData}
                movingTaskInfo={movingTaskInfo}
            />
            <Box sx={{
                height: '100%',
                overflowY: 'auto',
                pt: 1,
                cursor: movingTaskInfo ?
                    movingTaskInfo.moveType === "both" ? "grabbing" : 'ns-resize'
                    : ''
            }} >
                <Box id="day-grid-container" sx={{ position: 'relative' }}>
                    <HourGrid addDraftTaskInstance={addDraftTaskInstance} hourBlockHeight={hourBlockHeight} />
                    {taskInstances?.map((taskInstance, index) => {
                        const isResizing = movingTaskInfo?.taskInstance?.id === taskInstance.id;
                        const effectiveDuration = isResizing ? movingTaskInfo?.taskInstance?.duration : taskInstance.duration;
                        const effectiveStart = isResizing ? movingTaskInfo?.taskInstance?.start : taskInstance.start;
                        return (
                            <TaskInstanceCard
                                key={index}
                                taskInstance={taskInstance}
                                effectiveStart={effectiveStart}
                                effectiveDuration={effectiveDuration}
                                movingTaskInfo={movingTaskInfo}
                                startMovingTaskInstance={startMovingTaskInstance}
                                openTaskInstanceId={openTaskInstanceId}
                                setOpenTaskInstanceId={setOpenTaskInstanceId}
                                hourBlockHeight={hourBlockHeight}
                            />
                        );
                    })}

                    {draftTaskInstance && (
                        <DraftTaskInstanceCard
                            draftTaskInstance={draftTaskInstance}
                            setDraftTaskInstance={setDraftTaskInstance}
                            finalizeTaskInstance={finalizeTaskInstance}
                            tasks={tasks}
                        />
                    )}

                    {isViewingToday && (
                        <CurrentTimeBar nowMinuteOfDay={nowMinuteOfDay} />
                    )}
                </Box>
            </Box>
        </Box>
    );
};
