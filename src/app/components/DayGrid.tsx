/** @jsxImportSource @emotion/react */
import { Box, Button, createTheme, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { CREATE_TASK_INSTANCE, GET_TASK_INSTANCES, UPDATE_TASK_INSTANCE } from "../lib/graphql/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { DraftTaskInstance } from "./DraftTaskInstance";

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const daytimeHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

interface Task {
    id: string;
    title: string;
}

interface TaskInstance {
    id: string;
    task: Task;
    start: {
        date: string;
        hour: number;
        minute: number;
    };
    duration: number;
}

interface DraftTaskInstance {
    title: string;
    start: {
        date: string;
        hour: number;
        minute: number;
    };
    duration: number;
}

const HOUR_COLUMN_WIDTH = 50;

type MoveType = "start" | "end" | "both";

export const DayGrid = () => {
    const [currentDay, setCurrentDay] = useState(new Date(new Date().toDateString()));
    const [draftTaskInstance, setDraftTaskInstance] = useState<DraftTaskInstance | null>(null);
    const [movingTaskInfo, setMovingTaskInfo] = useState<{ taskInstance: TaskInstance, moveType: MoveType } | null>(null);

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

    const startMovingTaskInstance = (taskInstance: TaskInstance, event: React.MouseEvent, moveType: MoveType) => {
        setMovingTaskInfo({ taskInstance, moveType });
        document.body.style.userSelect = "none";
        event.stopPropagation();
    };

    const moveTaskInstance = (event: MouseEvent) => {
        if (movingTaskInfo) {
            const gridOffsetTop = document.querySelector("#day-grid-container")?.getBoundingClientRect().top || 0;
            const containerHeight = (document.querySelector("#day-grid-container")?.clientHeight || 1);
            const yPosition = event.clientY - gridOffsetTop;
            const minutesFromDaytimeStart = Math.floor(((yPosition + 3) / containerHeight) * daytimeHours.length * 60 / 15) * 15;
            const movingTaskInstance = movingTaskInfo.taskInstance;

            if (movingTaskInfo?.moveType === "end") {

                const taskInstanceStart = movingTaskInstance.start;
                const newDuration = minutesFromDaytimeStart - (taskInstanceStart.hour * 60 + taskInstanceStart.minute - daytimeHours[0] * 60);

                setMovingTaskInfo({
                    moveType: movingTaskInfo.moveType,
                    taskInstance: { ...movingTaskInstance, duration: Math.max(newDuration, 15) }
                });
            } else if (movingTaskInfo?.moveType === "start" || movingTaskInfo?.moveType === "both") {
                const minutesFromDayStart = daytimeHours[0] * 60 + minutesFromDaytimeStart;
                const newStartHour = Math.floor(minutesFromDayStart / 60);
                const newStartMinute = minutesFromDayStart % 60;

                const originalTaskInstance = taskInstances?.find(taskInstance => taskInstance.id === movingTaskInstance.id) as TaskInstance;
                const updatedDuration =
                    movingTaskInfo?.moveType === "both" ?
                        originalTaskInstance.duration :
                        originalTaskInstance.start.hour * 60 +
                        originalTaskInstance.start.minute +
                        originalTaskInstance.duration -
                        minutesFromDayStart;

                setMovingTaskInfo(state => state ? ({
                    ...state,
                    taskInstance: {
                        ...state.taskInstance,
                        duration: Math.max(updatedDuration, 15),
                        start: {
                            ...state.taskInstance.start,
                            hour: newStartHour,
                            minute: newStartMinute,
                        }
                    }
                }) : state);

            }
        }
    };

    const stopMovingTaskInstance = async () => {
        document.body.style.userSelect = "";

        if (movingTaskInfo) {
            const { taskInstance, moveType } = movingTaskInfo;
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

    const finalizeTaskInstance = useCallback(async (draftTaskInstance: DraftTaskInstance) => {
        await createTaskInstance({
            variables: {
                input: draftTaskInstance,
            },
        })
        await refetchTaskInstances();
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

    const isToday = currentDay.toDateString() === new Date().toDateString();
    const dayOfWeek = currentDay.toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <Box sx={{
            height: '100%',
            width: '100%'
            , overflowY: 'hidden',
        }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button onClick={() => setCurrentDay(new Date(currentDay.getTime() - 24 * 60 * 60 * 1000))}>{"<"}</Button>
                <Typography variant="h5">{isToday ? `Today (${dayOfWeek})` : dayOfWeek}</Typography>
                <Button onClick={() => setCurrentDay(new Date(currentDay.getTime() + 24 * 60 * 60 * 1000))}>{">"}</Button>
            </Box>
            <Box sx={{
                height: '100%',
                overflowY: 'auto',
                pt: 1,
                cursor: movingTaskInfo ?
                    movingTaskInfo.moveType === "both" ? "grabbing" : 'ns-move'
                    : ''
            }} >
                <Box id="day-grid-container" sx={{ position: 'relative' }}>
                    {daytimeHours.map((hour) => (
                        <Box key={hour} sx={{ display: 'flex', height: '60px' }}>
                            <Box sx={{ width: HOUR_COLUMN_WIDTH, marginTop: '-8px', textAlign: 'right', mr: 1 }}>
                                {hour}:00
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%",
                                    flexGrow: 1,
                                    borderTop: `1px solid ${theme.palette.grey[200]}`,
                                    position: "relative",
                                }}
                            >
                                {[0, 15, 30, 45].map((quarter) => (
                                    <Box
                                        key={quarter}
                                        sx={{ flex: 1 }}
                                        onClick={() => addDraftTaskInstance({ startHour: hour, startMinute: quarter })}
                                    />
                                ))}
                            </Box>
                        </Box>
                    ))}

                    {taskInstances?.map((taskInstance, index) => {
                        const isResizing = movingTaskInfo?.taskInstance?.id === taskInstance.id;
                        const effectiveDuration = isResizing ? movingTaskInfo?.taskInstance?.duration : taskInstance.duration;
                        const effectiveStart = isResizing ? movingTaskInfo?.taskInstance?.start : taskInstance.start;
                        return (
                            <Box
                                key={index}
                                sx={{
                                    position: "absolute",
                                    top: `CALC(1px + ${(((effectiveStart.hour - daytimeHours[0]) * 60 + effectiveStart.minute) / (daytimeHours.length * 60)) * 100}%)`,
                                    height: `${60 * effectiveDuration / 60 - 1}px`,
                                    left: HOUR_COLUMN_WIDTH + 16,
                                    width: "80%",
                                    backgroundColor: "rgba(63, 81, 181, 0.5)",
                                    borderRadius: "4px",
                                    padding: "4px",
                                    boxSizing: "border-box",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "8px",
                                        cursor: "ns-resize",
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden',
                                    }}
                                    onMouseDown={(e) => startMovingTaskInstance(taskInstance, e, "start")}
                                >
                                    <Box
                                        sx={{
                                            cursor: movingTaskInfo?.moveType === "both" ? "grabbing" :
                                                movingTaskInfo ? null : "grab",
                                            padding: '0 4px',
                                            fontSize: '1.2rem',
                                            color: 'rgba(256, 256, 256, 0.8)',
                                        }}
                                        onMouseDown={(e) => startMovingTaskInstance(taskInstance, e, "both")}>
                                        {"⋯"}
                                    </Box>
                                </Box>
                                {taskInstance.task.title}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: "8px",
                                        cursor: "ns-resize",
                                    }}
                                    onMouseDown={(e) => startMovingTaskInstance(taskInstance, e, "end")}
                                />
                            </Box>
                        );
                    })}

                    {draftTaskInstance && (
                        <DraftTaskInstance
                            draftTask={draftTaskInstance}
                            setDraftTask={setDraftTaskInstance}
                            finalizeTask={finalizeTaskInstance}
                        />
                    )}

                </Box>
            </Box>
        </Box>
    );
};
