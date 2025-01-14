import { Box, Card, CardContent, Typography, LinearProgress } from "@mui/material";
import { useQuery } from '@apollo/client';
import { GET_TASK_SUGGESTIONS } from "../lib/graphql/queries";
import { OpenDetailsPanelEntity, Task } from "./dayGrid/types";
import { useEffect, useState } from "react";
import TargetIcon from "@mui/icons-material/TrackChanges";
import RecurringIcon from "@mui/icons-material/EventRepeat";
import TodayEvent from "@mui/icons-material/Today";
import Event from "@mui/icons-material/Event";

const icons = {
    BALANCE_TARGET: TargetIcon,
    RECURRING: RecurringIcon,
    DATE_SOON: Event,
    DATE_TODAY: TodayEvent,
}

const SUGGESTION_GROUP_TYPES = {
    BALANCE_TARGET: 'BALANCE_TARGET',
    RECURRING: 'RECURRING',
};

export interface BasicTask {
    id: string;
    title: string;
    defaultDuration: number;
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
    tasks: (BasicTask | Task)[];
    type: string;
    data?: BalanceTarget;
}

interface TaskSuggestionsList {
    setOpenDetailsPanelEntity: (newOpenEntity: OpenDetailsPanelEntity | null) => void;
    setDraggedTask: (task:
        {
            task: BasicTask | Task;
            position: { x: number, y: number };
            width: number
        } | null) => void;
    draggedTask: { task: BasicTask | Task; position: { x: number; y: number }; width: number } | null;
}

let startTime = performance.now(); // Start time

const formattedRequestTime = () => {
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime;
    return `${Math.round(elapsedTime / 10) / 100} seconds`;
}

export const TasksList = ({
    setOpenDetailsPanelEntity,
    setDraggedTask,
    draggedTask,
}: TaskSuggestionsList) => {
    const { data } = useQuery<{ taskSuggestions: TaskGroup[] }>(GET_TASK_SUGGESTIONS, {
        onCompleted: (data) => {
            console.log("TaskSuggestions:", formattedRequestTime());
        },
        onError: (error) => {
            console.log("TaskSuggestions failed:", formattedRequestTime(), error);
        },
    });
    const taskSuggestions = data?.taskSuggestions;
    const [wasJustDragging, setWasJustDragging] = useState(false);

    useEffect(() => {
        startTime = performance.now(); // Reset start time
    }, []);

    useEffect(() => {
        if (draggedTask?.task.id) {
            if (!wasJustDragging) {
                setTimeout(() => {
                    setWasJustDragging(true);
                }, 500);
            }
        } else {
            setTimeout(() => {
                setWasJustDragging(false);
            }, 500);
        }
    }, [draggedTask?.task.id]);

    const handleMouseDown = (task: Task | BasicTask, event: React.MouseEvent) => {
        const originalCard = document.getElementById(`task-suggestion-task-${task.id}`);
        if (originalCard) {
            const rect = originalCard.getBoundingClientRect();
            setDraggedTask({
                task,
                position: { x: event.clientX, y: event.clientY },
                width: rect.width,
            });
        }
        document.body.style.userSelect = 'none';
    };

    if (!taskSuggestions) {
        return null;
    }

    const orderedGroups = [...taskSuggestions].sort((a, b) => {
        if (a.type === SUGGESTION_GROUP_TYPES.BALANCE_TARGET && b.type !== SUGGESTION_GROUP_TYPES.BALANCE_TARGET) {
            return 1;
        }
        if (b.type === SUGGESTION_GROUP_TYPES.BALANCE_TARGET && a.type !== SUGGESTION_GROUP_TYPES.BALANCE_TARGET) {
            return -1;
        }
        if (a.type === SUGGESTION_GROUP_TYPES.BALANCE_TARGET && b.type === SUGGESTION_GROUP_TYPES.BALANCE_TARGET) {
            if (a.data && b.data) {
                return a.data.progress - b.data.progress;
            }
        }
        return 0;
    })

    return (
        <Box sx={{ height: '100%', padding: 1, overflowY: 'auto', scrollbarGutter: 'none' }}>
            {orderedGroups.map((group, index) => {
                const Icon = icons[group.type as keyof typeof icons] || icons.BALANCE_TARGET;

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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <Icon sx={{ fontSize: 20, marginLeft: '2px' }} />
                            <Typography variant="subtitle2" color="textSecondary">
                                {group.name}
                            </Typography>

                            {group.type === SUGGESTION_GROUP_TYPES.BALANCE_TARGET && group.data && (
                                <Box sx={{ maxWidth: 40, flexGrow: 1 }} >
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min((group.data.progress / group.data.targetAmount) * 100, 100)}
                                        sx={{
                                            height: 4,
                                            borderRadius: 1,
                                            backgroundColor: 'grey.200',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: 'grey.500',
                                            },
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                        {group.tasks.map((task) => (
                            <Card
                                key={task.id}
                                onMouseDown={(event) => handleMouseDown(task, event)}
                                onClick={wasJustDragging ? undefined : () => {
                                    setOpenDetailsPanelEntity({ id: task.id, type: "Task" });
                                }}
                                sx={{
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                }}
                                id={`task-suggestion-task-${task.id}`}
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