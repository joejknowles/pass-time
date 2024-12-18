/** @jsxImportSource @emotion/react */
import { Box, createTheme } from "@mui/material";
import { useCallback, useState } from "react";
import { CREATE_TASK_INSTANCE } from "../lib/graphql/mutations";
import { useMutation } from "@apollo/client";
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
})

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
    const [taskInstances, setTaskInstances] = useState<TaskInstance[]>([]);
    const [draftTask, setDraftTask] = useState<DraftTaskInstance | null>(null);

    const [createTask, { error: graphqlError }] = useMutation(CREATE_TASK_INSTANCE);

    const finalizeTask = useCallback(async (draftTask: DraftTaskInstance) => {
        const result = await createTask({
            variables: {
                input: draftTask,
            },
        })

        const newTaskInstance = result.data.createTaskInstance as TaskInstance;
        setTaskInstances([...taskInstances, newTaskInstance]);
        setDraftTask(null);
    }, [draftTask])

    const addDraftTaskInstance = ({ startHour, startMinute }: { startHour: number, startMinute: number, endHour: number, endMinute: number }) => {
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
        <Box sx={{ height: '100%', width: '100%', overflowY: 'auto', pt: 1 }} >
            <Box sx={{ position: 'relative' }}>
                {
                    daytimeHours.map((hour) => (
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
                                        sx={{
                                            flex: 1,
                                        }}
                                        onClick={() => {
                                            addDraftTaskInstance({
                                                startHour: hour,
                                                startMinute: quarter,
                                                endHour: hour,
                                                endMinute: quarter + 30,
                                            });
                                        }}
                                    />
                                ))}
                            </Box>

                        </Box>
                    ))
                }

                {taskInstances.map((taskInstance, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: "absolute",
                            top: `${(((taskInstance.start.hour - daytimeHours[0]) * 60 + taskInstance.start.minute) / (daytimeHours.length * 60)) * 100}%`,
                            height: `${((taskInstance.duration) / (daytimeHours.length * 60)) * 100}%`,
                            left: HOUR_COLUMN_WIDTH + 16,
                            width: "80%",
                            backgroundColor: "rgba(63, 81, 181, 0.5)",
                            borderRadius: "4px",
                            padding: "4px",
                            boxSizing: "border-box",
                        }}
                    >
                        {taskInstance.task.title}
                    </Box>
                ))}

                {
                    draftTask && (
                        <DraftTaskInstance
                            draftTask={draftTask}
                            setDraftTask={setDraftTask}
                            finalizeTask={finalizeTask}
                        />
                    )
                }

            </Box>
        </Box>
    );
};