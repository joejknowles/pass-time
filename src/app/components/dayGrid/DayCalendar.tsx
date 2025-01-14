/** @jsxImportSource @emotion/react */
import { Box, LinearProgress, useMediaQuery, Typography, Card, CardContent } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CREATE_TASK_INSTANCE, GET_TASK_INSTANCES, GET_TASKS, UPDATE_TASK_INSTANCE } from "../../lib/graphql/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { DraftTaskInstanceCard as DraftTaskInstanceCard } from "./DraftTaskInstanceCard";
import EntityDetailsPanel from "../entityDetailsPanel/EntityDetailsPanel";
import CurrentTimeBar from "./CurrentTimeBar";
import { daytimeHours, HOUR_COLUMN_WIDTH } from "./consts";
import HourGrid from "./HourGrid";
import CurrentDayHeader from "./CurrentDayHeader";
import TaskInstanceCard from "./TaskInstanceCard";
import { isToday } from "./utils";
import type { DraftTaskInstance, OpenDetailsPanelEntity, Task, TaskInstance } from "./types";
import { useTaskInstanceMovement } from "./useTaskInstanceMovement";
import { BasicTask } from "../TaskSuggestionsList";

const minutesToMs = (minutes: number) => minutes * 60 * 1000;

interface DraggedTask {
    task: Task | BasicTask;
    position: { x: number, y: number };
    width: number;
}

interface DayCalendarProps {
    openDetailsPanelEntity: OpenDetailsPanelEntity | null;
    setOpenDetailsPanelEntity: (newOpenEntity: OpenDetailsPanelEntity | null) => void;
    draggedTask: DraggedTask | null;
    setDraggedTask: React.Dispatch<React.SetStateAction<DraggedTask | null>>;
}

export const DayCalendar = ({
    openDetailsPanelEntity,
    setOpenDetailsPanelEntity,
    draggedTask,
    setDraggedTask,
}: DayCalendarProps) => {
    const [currentDay, setCurrentDay] = useState(new Date(new Date().toDateString()));
    const [nowMinuteOfDay, setNowMinuteOfDay] = useState(new Date().getHours() * 60 + new Date().getMinutes());
    const [draftTaskInstance, setDraftTaskInstance] = useState<DraftTaskInstance | null>(null);

    const [isSubmittingTaskInstance, setIsSubmittingTaskInstance] = useState(false);

    const isNarrowScreen = useMediaQuery("(max-width:710px)");

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
        pollInterval: minutesToMs(15)
    });
    const taskInstances = taskInstancesData?.taskInstances;
    const {
        data: taskData,
        error: errorFromGetTasks,
        loading: loadingTasks,
        refetch: refetchTasks
    } = useQuery<{ tasks: Task[] }>(GET_TASKS, {
        pollInterval: minutesToMs(15)
    });
    const tasks = taskData?.tasks;

    const [hasDraggedForABit, setHasDraggedForABit] = useState(false);

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

    const refetchAllTaskData = useCallback(async () => {
        await Promise.all([refetchTaskInstances(), refetchTasks()]);
    }, [refetchTaskInstances, refetchTasks]);

    const getTimeFromCursor = (clientY: number) => {
        const container = document.getElementById("day-grid-container");
        if (!container) return { startHour: 0, startMinute: 0 };

        const rect = container.getBoundingClientRect();
        const taskDuration = draftTaskInstance?.duration || 30;
        const offsetsByDuration = {
            15: 2,
            30: 10,
        }
        const THRESHOLD_OFFSET = offsetsByDuration[taskDuration as keyof typeof offsetsByDuration] || 15;
        const y = clientY - rect.top - THRESHOLD_OFFSET;
        const totalMinutes = (y / rect.height) * (daytimeHours.length * 60);
        const startHour = Math.floor(totalMinutes / 60) + daytimeHours[0];

        const startMinute = Math.floor(Math.floor(totalMinutes % 60) / 15) * 15;

        return { startHour, startMinute };
    };

    const updateDraftTaskInstance = ({ startHour, startMinute, task }: { startHour: number, startMinute: number, task?: Task | BasicTask }) => {
        const newTaskInstance: DraftTaskInstance = {
            title: task?.title || "",
            start: {
                date: currentDay.toISOString().split('T')[0],
                hour: startHour,
                minute: startMinute,
            },
            duration: task?.defaultDuration || 30,
            taskId: task?.id,
        };
        setDraftTaskInstance(newTaskInstance);
    };

    const finalizeDraftTaskInstance = () => {
        if (draftTaskInstance) {
            finalizeTaskInstance(draftTaskInstance);
            if (draggedTask) {
                setDraggedTask(null);
            }
        }
    };

    const { movingTaskInfo, startMovingTaskInstance } = useTaskInstanceMovement(
        taskInstances,
        updateTaskInstance,
        draftTaskInstance,
        updateDraftTaskInstance,
        finalizeDraftTaskInstance,
        getTimeFromCursor,
        draggedTask
    );

    const isViewingToday = useMemo(() => isToday(currentDay), [currentDay, nowMinuteOfDay]);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        const updateNowMinuteOfDay = () => {
            setNowMinuteOfDay(new Date().getHours() * 60 + new Date().getMinutes());
        };

        const setUpInterval = () => {
            clearInterval(interval);
            updateNowMinuteOfDay();
            interval = setInterval(updateNowMinuteOfDay, 60 * 1000);
        };

        const nextMinuteStartsInMs = (60 - new Date().getSeconds()) * 1000;
        const initialTimeout = setTimeout(setUpInterval, nextMinuteStartsInMs);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (isViewingToday && currentDay.getTime() !== new Date().getTime()) {
                    setCurrentDay(new Date(new Date().toDateString()));
                }
                setUpInterval();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            clearTimeout(initialTimeout);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isViewingToday]);

    useEffect(() => {
        refetchAllTaskData();
    }, [currentDay]);

    const finalizeTaskInstance = useCallback(async (draftTaskInstance: DraftTaskInstance) => {
        setIsSubmittingTaskInstance(true);
        const { duration, ...inputValues } = draftTaskInstance;
        const newTaskInstance = await createTaskInstance({
            variables: {
                input: inputValues,
            },
        })
        const newTaskId: string = newTaskInstance.data?.createTaskInstance.id
        setOpenDetailsPanelEntity({
            id: newTaskId,
            type: "TaskInstance"
        });
        await refetchAllTaskData();
        setDraftTaskInstance(null);
        setIsSubmittingTaskInstance(false);
        // repeat set state to make sure the scroll happens
        setOpenDetailsPanelEntity({
            id: newTaskId,
            type: "TaskInstance"
        });
    }, [draftTaskInstance]);

    const handleMouseMove = (event: MouseEvent) => {
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
                isPastLeftSide
            if (!draftTaskInstance && isOverDayGrid) {
                const { startHour, startMinute } = getTimeFromCursor(event.clientY);
                updateDraftTaskInstance({ startHour, startMinute, task: draggedTask.task as Task });
            } else if (draftTaskInstance && !isOverDayGrid) {
                setDraftTaskInstance(null);
            }
        }
    };

    useEffect(() => {
        if (draggedTask) {
            const handleMouseUp = () => {
                if (!draftTaskInstance) {
                    setDraggedTask(null);
                    document.body.style.userSelect = ''; // Re-enable text selection
                }
            };

            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);

            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
                document.body.style.userSelect = ''; // Re-enable text selection
            };
        }
    }, [draggedTask, draftTaskInstance]);

    const addDraftTaskInstance = ({ startHour, startMinute, task }: { startHour: number, startMinute: number, task?: Task }) => {
        const newTaskInstance: DraftTaskInstance = {
            title: task?.title || "",
            start: {
                date: currentDay.toISOString().split('T')[0],
                hour: startHour,
                minute: startMinute,
            },
            duration: 30,
            taskId: task?.id,
        };
        setDraftTaskInstance(newTaskInstance);
    };

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

    const getCursor = () => {
        const isGrabbing = movingTaskInfo?.moveType === "both" || !!draggedTask;
        if (isGrabbing) {
            return 'grabbing';
        }
        const isResizing = movingTaskInfo && movingTaskInfo.moveType !== "both"
        if (isResizing) {
            return 'ns-resize';
        }
        return '';
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
            <EntityDetailsPanel
                openDetailsPanelEntity={openDetailsPanelEntity}
                taskInstances={taskInstances}
                tasks={tasks}
                setOpenDetailsPanelEntity={setOpenDetailsPanelEntity}
                refetchAllTaskData={refetchAllTaskData}
                movingTaskInfo={movingTaskInfo}
                setCurrentDay={setCurrentDay}
            />
            <Box sx={{
                height: '100%',
                overflowY: 'auto',
                pt: 1,
                cursor: getCursor(),
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

                        const isCurrentlyOpen =
                            openDetailsPanelEntity?.type === "TaskInstance" &&
                            openDetailsPanelEntity.id === taskInstance.id;
                        return (
                            <TaskInstanceCard
                                key={index}
                                taskInstance={taskInstance}
                                effectiveStart={effectiveStart}
                                effectiveDuration={effectiveDuration}
                                movingTaskInfo={movingTaskInfo}
                                startMovingTaskInstance={startMovingTaskInstance}
                                isThisTaskDetailsOpen={isCurrentlyOpen}
                                handleClick={() => {
                                    if (movingTaskInfo?.hasChanged) {
                                        return;
                                    }
                                    if (isCurrentlyOpen) {
                                        setOpenDetailsPanelEntity(null)
                                    } else {
                                        setOpenDetailsPanelEntity({
                                            id: taskInstance.id,
                                            type: "TaskInstance"
                                        })
                                    }
                                }}
                                hourBlockHeight={hourBlockHeight}
                            />
                        );
                    })}

                    {draftTaskInstance && (
                        <DraftTaskInstanceCard
                            draftTaskInstance={draftTaskInstance}
                            setDraftTaskInstance={setDraftTaskInstance}
                            finalizeTaskInstance={finalizeTaskInstance}
                            tasks={tasks as Task[]}
                            isBeingDragged={!!draggedTask}
                            isSubmitting={isSubmittingTaskInstance}
                        />
                    )}

                    {isViewingToday && (
                        <CurrentTimeBar nowMinuteOfDay={nowMinuteOfDay} />
                    )}
                </Box>
            </Box>
            {!draftTaskInstance && draggedTask && hasDraggedForABit && (
                <Card
                    raised
                    sx={{
                        backgroundColor: 'white',
                        cursor: 'grabbing',
                        position: 'fixed',
                        top: draggedTask.position.y,
                        left: draggedTask.position.x,
                        transform: 'translate(-50%, -50%) rotate(-1deg)',
                        width: draggedTask.width,
                    }}
                >
                    <CardContent
                        sx={{
                            '&:last-child': {
                                pb: 2,
                            },
                        }}
                    >
                        <Typography variant="body1" color="text.primary">
                            {draggedTask.task.title}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};
