/** @jsxImportSource @emotion/react */
import { Box, LinearProgress, useMediaQuery, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CREATE_TASK_INSTANCE, GET_TASK_INSTANCES, GET_TASKS, UPDATE_TASK_INSTANCE } from "../../lib/graphql/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { DraftTaskInstanceCard as DraftTaskInstanceCard } from "./DraftTaskInstanceCard";
import TaskInstanceModal from "../TaskInstanceModal";
import CurrentTimeBar from "./CurrentTimeBar";
import { HOUR_COLUMN_WIDTH } from "./consts";
import HourGrid from "./HourGrid";
import CurrentDayHeader from "./CurrentDayHeader";
import TaskInstanceCard from "./TaskInstanceCard";
import { isToday } from "./utils";
import type { DraftTaskInstance, Task, TaskInstance } from "./types";
import { useTaskInstanceMovement } from "./useTaskInstanceMovement";

export const DayCalendar = () => {
    const [currentDay, setCurrentDay] = useState(new Date(new Date().toDateString()));
    const [nowMinuteOfDay, setNowMinuteOfDay] = useState(new Date().getHours() * 60 + new Date().getMinutes());
    const [draftTaskInstance, setDraftTaskInstance] = useState<DraftTaskInstance | null>(null);

    const [isSubmittingTaskInstance, setIsSubmittingTaskInstance] = useState(false);

    const isNarrowScreen = useMediaQuery("(max-width:710px)");

    const [openTaskInstanceId, setOpenTaskInstanceIdRaw] = useState<string | null>(null);
    const setOpenTaskInstanceId = (id: string | null) => {
        setOpenTaskInstanceIdRaw(id);
        if (isNarrowScreen) {
            const taskInstanceCard = document.getElementById(`task-instance-calendar-card-${id}`);
            if (taskInstanceCard) {
                const topOffset = taskInstanceCard.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2) + 100;
                window.scrollTo({ top: topOffset, behavior: 'smooth' });
            }
        }
    }

    const [createTaskInstance, {
        error: errorFromCreatingTaskInstance
    }] = useMutation(CREATE_TASK_INSTANCE);
    const [updateTaskInstance, { error: errorFromUpdatingTaskInstance }] = useMutation(UPDATE_TASK_INSTANCE);
    const {
        data: taskInstancesData,
        error: errorFromGetTaskInstances,
        loading: loadingTaskInstances,
        refetch: refetchTaskInstances,
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
        loading: loadingTasks,
        refetch: refetchTasks
    } = useQuery<{ tasks: Task[] }>(GET_TASKS);
    const tasks = taskData?.tasks;

    const refetchAllTaskData = useCallback(async () => {
        await Promise.all([refetchTaskInstances(), refetchTasks()]);
    }, [refetchTaskInstances, refetchTasks]);

    const { movingTaskInfo, startMovingTaskInstance } = useTaskInstanceMovement(taskInstances, updateTaskInstance);

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

    useEffect(() => {
        refetchAllTaskData();
    }, [currentDay]);

    const finalizeTaskInstance = useCallback(async (draftTaskInstance: DraftTaskInstance) => {
        setIsSubmittingTaskInstance(true);
        const newTaskInstance = await createTaskInstance({
            variables: {
                input: draftTaskInstance,
            },
        })
        const newTaskId = newTaskInstance.data?.createTaskInstance.id
        setOpenTaskInstanceId(newTaskId);
        await refetchAllTaskData();
        setDraftTaskInstance(null);
        setIsSubmittingTaskInstance(false);
        setOpenTaskInstanceId(newTaskId);
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

    const isViewingToday = useMemo(() => isToday(currentDay), [currentDay]);

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

    if (errorFromGetTaskInstances || errorFromGetTasks) {
        return <Typography color="error">Error loading data, please reload the page or contact us</Typography>;
    }

    if (errorFromCreatingTaskInstance || errorFromUpdatingTaskInstance) {
        return <Typography color="error">Error saving data. Please refresh and try again.</Typography>;
    }

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
                setCurrentDay={setCurrentDay}
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
                    {(loadingTaskInstances || loadingTasks) && (
                        <LinearProgress
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: HOUR_COLUMN_WIDTH + 8,
                                width: '100%',
                                height: '2px',
                            }}
                        />
                    )}
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
                            isSubmittingTaskInstance={isSubmittingTaskInstance}
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
