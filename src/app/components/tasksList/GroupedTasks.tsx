import { Box, LinearProgress } from "@mui/material";
import { useQuery } from '@apollo/client';
import { GET_TASK_SUGGESTIONS } from "../../lib/graphql/queries";
import { OpenDetailsPanelEntity, Task } from "../dayGrid/types";
import { useEffect, useState } from "react";
import { BasicTask, TaskGroup } from "./types";
import { TaskGroupCard, TaskGroupType } from "./TaskGroupCard";
import { TaskCard } from "./TaskCard";

const SUGGESTION_GROUP_TYPES = {
    BALANCE_TARGET: 'BALANCE_TARGET',
    RECURRING: 'RECURRING',
    DUE_DATE: 'DUE_DATE',
};


interface GroupedTasksProps {
    setOpenDetailsPanelEntity: (newOpenEntity: OpenDetailsPanelEntity | null) => void;
    setDraggedTask: (task:
        {
            task: BasicTask | Task;
            position: { x: number, y: number };
            width: number
        } | null) => void;
    draggedTask: { task: BasicTask | Task; position: { x: number; y: number }; width: number } | null;
    additionalTaskGroups: TaskGroup[];
    isVisible: boolean;
}

let startTime = performance.now(); // Start time

const formattedRequestTime = () => {
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime;
    return `${Math.round(elapsedTime / 10) / 100} seconds`;
}

export const GroupedTasks = ({
    setOpenDetailsPanelEntity,
    setDraggedTask,
    draggedTask,
    additionalTaskGroups,
    isVisible,
}: GroupedTasksProps) => {
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

    if (!taskSuggestions || !isVisible) {
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...additionalTaskGroups, ...orderedGroups].map((group, index) => {
                const headerExtraSlot = group.type === SUGGESTION_GROUP_TYPES.BALANCE_TARGET && group.data ? (
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
                ) : null;

                return (
                    <TaskGroupCard
                        key={`${group.type}-${group.name}`}
                        title={group.name}
                        type={group.type as TaskGroupType}
                        headerExtraSlot={headerExtraSlot}>
                        {group.tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                id={`task-suggestion-task-${task.id}`}
                                onClick={wasJustDragging ? undefined : () => {
                                    setOpenDetailsPanelEntity({ id: task.id, type: "Task" });
                                }}
                                onMouseDown={(event) => handleMouseDown(task, event)}
                            >
                                {task.title}
                            </TaskCard>
                        ))}
                    </TaskGroupCard>
                );
            })}
        </Box>
    );
};