import { Box, Card, CardContent, Typography } from "@mui/material";
import { useQuery } from '@apollo/client';
import { GET_TASK_SUGGESTIONS } from "../lib/graphql/queries";
import { OpenDetailsPanelEntity } from "./dayGrid/types";
import { useEffect } from "react";

interface Task {
    id: string;
    title: string;
}

interface BalanceTarget {
    id: string;
    timeWindow: string;
    targetAmount: number;
    progress: number;
    task: Task;
}

interface TaskGroup {
    name: string;
    tasks: Task[];
    type: string;
    data: BalanceTarget;
}

interface TaskSuggestionsProps {
    setOpenDetailsPanelEntity: (newOpenEntity: OpenDetailsPanelEntity | null) => void;
}

let startTime = performance.now(); // Start time

const formattedRequestTime = () => {
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime;
    return `${Math.round(elapsedTime / 10) / 100} seconds`;
}

export const TaskSuggestions = ({
    setOpenDetailsPanelEntity,
}: TaskSuggestionsProps) => {
    const { data } = useQuery<{ taskSuggestions: TaskGroup[] }>(GET_TASK_SUGGESTIONS, {
        onCompleted: (data) => {
            console.log("TaskSuggestions:", formattedRequestTime());
        },
        onError: (error) => {
            console.log("TaskSuggestions failed:", formattedRequestTime(), error);
        },
    });
    const taskSuggestions = data?.taskSuggestions;

    useEffect(() => {
        startTime = performance.now(); // Reset start time
    }, []);

    if (!taskSuggestions) {
        return null;
    }

    return (
        <Box sx={{ height: '100%', padding: 1, overflowY: 'auto', scrollbarGutter: 'none' }}>
            {taskSuggestions.map((group, index) => (
                <Box
                    key={index}
                    sx={{
                        mb: 2,
                        backgroundColor: 'grey.100',
                        p: 1,
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                    }}
                >
                    <Typography variant="h6">
                        Target: {group.name} ({group.data.progress}/{group.data.targetAmount})
                    </Typography>
                    {group.tasks.map((task) => (
                        <Card
                            key={task.id}
                            onClick={() => {
                                setOpenDetailsPanelEntity({ id: task.id, type: "Task" });
                            }}
                            sx={{
                                backgroundColor: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            <CardContent
                                sx={{
                                    '&:last-child': {
                                        pb: 2,
                                    },
                                }}
                            >
                                {task.title}
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ))}
        </Box>
    );
};