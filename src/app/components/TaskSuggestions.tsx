import { Box, Card, CardContent, Typography } from "@mui/material";
import { useQuery } from '@apollo/client';
import { GET_TASK_SUGGESTIONS } from "../lib/graphql/queries";
import { OpenDetailsPanelEntity } from "./dayGrid/types";
import { useEffect } from "react";
import TargetIcon from "@mui/icons-material/TrackChanges";
import RecurringIcon from "@mui/icons-material/EventRepeat";

const icons = {
    BALANCE_TARGET: TargetIcon,
    RECURRING: RecurringIcon
}

const SUGGESTION_GROUP_TYPES = {
    BALANCE_TARGET: 'BALANCE_TARGET',
    RECURRING: 'RECURRING',
};

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
    data?: BalanceTarget;
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
            {taskSuggestions.map((group, index) => {

                let headingText = group.name;
                if (group.type === SUGGESTION_GROUP_TYPES.BALANCE_TARGET && group.data) {
                    headingText += ` (${group.data.progress}/${group.data.targetAmount})`
                }

                const Icon = icons[group.type as keyof typeof icons];

                return (
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <Icon sx={{ fontSize: 20, marginLeft: '2px' }} />
                            <Typography variant="subtitle2" color="textSecondary">
                                {headingText}
                            </Typography>
                        </Box>
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
                                    <Typography variant="body1" color="text.primary">
                                        {task.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )
            })}
        </Box>
    );
};