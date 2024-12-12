import { Box, Container, createTheme } from "@mui/material";
import { useState } from "react";

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

const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

interface Task {
    id?: string;
    title?: string;
    start: {
        hour: number;
        minute: number;
    };
    duration: number;
}

const HOUR_COLUMN_WIDTH = 50;

export const DayGrid = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const addTask = ({ startHour, startMinute }: { startHour: number, startMinute: number, endHour: number, endMinute: number }) => {
        const newTask: Task = {
            start: {
                hour: startHour,
                minute: startMinute,
            },
            duration: 30,
        }
        setTasks([...tasks, newTask]);
    }
    console.log(tasks)
    return (
        <Box sx={{ height: '100%', width: '100%', overflowY: 'auto', pt: 1 }} >
            <Box sx={{ position: 'relative' }}>
                {
                    hours.map((hour) => (
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
                                            addTask({
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

                {tasks.map((task, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: "absolute",
                            top: `${(((task.start.hour - hours[0]) * 60 + task.start.minute) / (hours.length * 60)) * 100}%`,
                            height: `${((task.duration) / (hours.length * 60)) * 100}%`,
                            left: HOUR_COLUMN_WIDTH + 16,
                            width: "80%",
                            backgroundColor: "rgba(63, 81, 181, 0.5)",
                            borderRadius: "4px",
                            padding: "4px",
                            boxSizing: "border-box",
                        }}
                    >
                        {task.title || 'Untitled...'}
                    </Box>
                ))}</Box>
        </Box>
    );
};