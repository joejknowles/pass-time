/** @jsxImportSource @emotion/react */
import { Box, LinearProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { CREATE_TASK_INSTANCE, UPDATE_TASK_INSTANCE } from "../../lib/graphql/mutations";
import { GET_TASK_INSTANCES } from '@/app/lib/graphql/queries';
import { useMutation, useQuery } from "@apollo/client";
import { DraftTaskInstanceCard as DraftTaskInstanceCard } from "./DraftTaskInstanceCard";
import EntityDetailsPanel from "../entityDetailsPanel/EntityDetailsPanel";
import CurrentTimeBar from "./CurrentTimeBar";
import { daytimeHours, HOUR_COLUMN_WIDTH } from "./consts";
import HourGrid from "./HourGrid";
import CurrentDayHeader from "./CurrentDayHeader";
import { getCursor } from "./utils";
import type { DraftTaskInstance, OpenDetailsPanelEntity, Task, TaskInstance } from "./types";
import { useTaskInstanceMovement } from "./useTaskInstanceMovement";
import { BasicTask, DraggedTask } from "../tasksList/types";
import { useTasks } from "@/app/lib/hooks/useTasks";
import { DraggedTaskCard } from "./DraggedTaskCard";
import PositionedTaskInstanceCards from "./taskInstanceCards/PositionedTaskInstanceCards";
import { useCurrentTimeAndDay } from "./useCurrentTimeAndDay";
import { useDevice } from "@/app/lib/hooks/useDevice";

const minutesToMs = (minutes: number) => minutes * 60 * 1000;

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
    const {
        currentDay,
        setCurrentDay,
        nowMinuteOfDay,
        isViewingToday
    } = useCurrentTimeAndDay();

    const [draftTaskInstance, setDraftTaskInstance] = useState<DraftTaskInstance | null>(null);

    const [isSubmittingTaskInstance, setIsSubmittingTaskInstance] = useState(false);

    const { isPhabletWidthOrLess } = useDevice();

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
                date: currentDay.toLocaleDateString('en-CA'),
            },
        },
        pollInterval: minutesToMs(15),
    });
    const taskInstances = taskInstancesData?.taskInstances;
    const { tasks, refetchTasks, error: errorFromGetTasks, loading: loadingTasks } = useTasks();

    const refetchAllTaskData = useCallback(async () => {
        await Promise.all([refetchTaskInstances(), refetchTasks()]);
    }, [refetchTaskInstances, refetchTasks]);


    const updateDraftTaskInstance = ({ startHour, startMinute, task }: { startHour: number, startMinute: number, task?: Task | BasicTask }) => {
        const newTaskInstance: DraftTaskInstance = {
            title: task?.title || "",
            start: {
                date: currentDay.toLocaleDateString('en-CA'),
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

    const taskInstanceMovement = useTaskInstanceMovement(
        taskInstances,
        updateTaskInstance,
        draftTaskInstance,
        updateDraftTaskInstance,
        finalizeDraftTaskInstance,
        draggedTask,
        setDraggedTask,
        setDraftTaskInstance,
        daytimeHours,
        !!openDetailsPanelEntity,
    );
    const {
        movingTaskInfo,
        startMovingTaskInstance,
        hasDraggedForABit,
        taskInstanceInTouchEditMode
    } = taskInstanceMovement;

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

    const addDraftTaskInstance = ({ startHour, startMinute, task }: { startHour: number, startMinute: number, task?: Task }) => {
        const newTaskInstance: DraftTaskInstance = {
            title: task?.title || "",
            start: {
                date: currentDay.toLocaleDateString('en-CA'),
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
                    date: day.toLocaleDateString('en-CA')
                }
            }) : dti);
        }
    }

    const hourBlockHeight = isPhabletWidthOrLess ? 60 : 60;

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
            flexShrink: 1,
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
            <Box
                id="day-grid-scroll-container"
                sx={{
                    height: '100%',
                    overflowY: 'auto',
                    pt: 1,
                    pb: isPhabletWidthOrLess ? openDetailsPanelEntity ? '50dvh' : 0 : 1,
                    cursor: getCursor(movingTaskInfo, draggedTask),
                    // causes issues on desktop touches, but seems fine on mobiles
                    touchAction: taskInstanceInTouchEditMode ? "none" : "auto",
                }}
            >
                <Box
                    id="day-grid-container"
                    sx={{
                        position: 'relative'
                    }}
                >
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
                    <HourGrid
                        addDraftTaskInstance={(time) => {
                            if (!isSubmittingTaskInstance && !draftTaskInstance && !openDetailsPanelEntity && !taskInstanceInTouchEditMode) {
                                addDraftTaskInstance(time);
                            }
                        }}
                        hourBlockHeight={hourBlockHeight}
                    />
                    <PositionedTaskInstanceCards
                        taskInstances={taskInstances}
                        openDetailsPanelEntity={openDetailsPanelEntity}
                        movingTaskInfo={movingTaskInfo}
                        startMovingTaskInstance={startMovingTaskInstance}
                        setOpenDetailsPanelEntity={setOpenDetailsPanelEntity}
                        hourBlockHeight={hourBlockHeight}
                        taskInstanceMovement={taskInstanceMovement}
                    />
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
                <DraggedTaskCard draggedTask={draggedTask} />
            )}
        </Box>
    );
};
