/** @jsxImportSource @emotion/react */
import { Box, createTheme } from "@mui/material";
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

export const DayGrid = () => {
    const [draftTask, setDraftTask] = useState<DraftTaskInstance | null>(null);
    const [resizingTask, setResizingTask] = useState<TaskInstance | null>(null);

    const [createTask, { error: createTaskError }] = useMutation(CREATE_TASK_INSTANCE);
    const [updateTask, { error: updateTaskError }] = useMutation(UPDATE_TASK_INSTANCE);
    const {
        data: taskInstancesData,
        error: taskInstancesError,
        refetch: refetchTaskInstances
    } = useQuery<{ taskInstances: TaskInstance[] }>(GET_TASK_INSTANCES);
    const taskInstances = taskInstancesData?.taskInstances;

    const startResize = (task: TaskInstance, event: React.MouseEvent) => {
        setResizingTask(task);
        document.body.style.userSelect = "none";
        event.stopPropagation();
    };

    const resizeTask = (event: MouseEvent) => {
        if (resizingTask) {
            const gridOffsetTop = document.querySelector("#day-grid-container")?.getBoundingClientRect().top || 0;
            const containerHeight = (document.querySelector("#day-grid-container")?.clientHeight || 1);
            const yPosition = event.clientY - gridOffsetTop;

            const minutesFromStart = Math.round((yPosition / containerHeight) * daytimeHours.length * 60 / 15) * 15;

            const newDuration = minutesFromStart - (resizingTask.start.hour * 60 + resizingTask.start.minute - daytimeHours[0] * 60);

            setResizingTask({ ...resizingTask, duration: Math.max(newDuration, 15) });
        }
    };

    const stopResize = async () => {
        document.body.style.userSelect = "";

        if (resizingTask) {
            await updateTask({
                variables: {
                    input: {
                        id: resizingTask.id,
                        duration: resizingTask.duration,
                    },
                },
            });
        }

        setResizingTask(null);
    };

    useEffect(() => {
        if (resizingTask) {
            window.addEventListener("mousemove", resizeTask);
            window.addEventListener("mouseup", stopResize);
        }
        return () => {
            window.removeEventListener("mousemove", resizeTask);
            window.removeEventListener("mouseup", stopResize);
        };
    }, [resizingTask]);

    const finalizeTask = useCallback(async (draftTask: DraftTaskInstance) => {
        await createTask({
            variables: {
                input: draftTask,
            },
        })
        await refetchTaskInstances();
        setDraftTask(null);
    }, [draftTask])

    const addDraftTaskInstance = ({ startHour, startMinute }: { startHour: number, startMinute: number }) => {
        const newTask: DraftTaskInstance = {
            title: "",
            start: {
                date: new Date().toISOString().split('T')[0],
                hour: startHour,
                minute: startMinute,
            },
            duration: 30,
        };
        setDraftTask(newTask);
    }

    return (
        <Box sx={{ height: '100%', width: '100%', overflowY: 'auto', pt: 1, cursor: resizingTask ? 'ns-resize' : '' }} >
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
                    const isResizing = resizingTask?.id === taskInstance.id;
                    const effectiveDuration = isResizing ? resizingTask?.duration : taskInstance.duration;
                    return (
                        <Box
                            key={index}
                            sx={{
                                position: "absolute",
                                top: `${(((taskInstance.start.hour - daytimeHours[0]) * 60 + taskInstance.start.minute) / (daytimeHours.length * 60)) * 100}%`,
                                height: `${60 * effectiveDuration / 60}px`,
                                left: HOUR_COLUMN_WIDTH + 16,
                                width: "80%",
                                backgroundColor: "rgba(63, 81, 181, 0.5)",
                                borderRadius: "4px",
                                padding: "4px",
                                boxSizing: "border-box",
                            }}
                        >
                            {taskInstance.task.title}
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: "8px",
                                    cursor: "ns-resize",
                                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                                }}
                                onMouseDown={(e) => startResize(taskInstance, e)}
                            />
                        </Box>
                    );
                })}

                {draftTask && (
                    <DraftTaskInstance
                        draftTask={draftTask}
                        setDraftTask={setDraftTask}
                        finalizeTask={finalizeTask}
                    />
                )}

            </Box>
        </Box>
    );
};
