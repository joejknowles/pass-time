import { Box, useMediaQuery } from "@mui/material";
import { OpenDetailsPanelEntity, Task } from "../dayGrid/types";
import { GroupedTasks } from "./GroupedTasks";
import { BasicTask, TaskGroup } from "./types";
import CreateOrSelectTask from "../dayGrid/CreateOrSelectTask";
import { useEffect, useState } from "react";
import { GET_TASKS } from "@/app/lib/graphql/mutations";
import { useQuery } from "@apollo/client";

interface TasksListProps {
    setOpenDetailsPanelEntity: (newOpenEntity: OpenDetailsPanelEntity | null) => void;
    setDraggedTask: (task:
        {
            task: BasicTask | Task;
            position: { x: number, y: number };
            width: number
        } | null) => void;
    draggedTask: { task: BasicTask | Task; position: { x: number; y: number }; width: number } | null;
}

export const TasksList = ({
    setOpenDetailsPanelEntity,
    setDraggedTask,
    draggedTask,
}: TasksListProps) => {
    const isNarrowScreen = useMediaQuery("(max-width:710px)");
    const [showGroupedTasks, setShowGroupedTasks] = useState(isNarrowScreen);
    const [inputText, setInputText] = useState("");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [additionalTaskGroups, setAdditionalTaskGroups] = useState<TaskGroup[]>([]);
    const {
        data: taskData,
        error: errorFromGetTasks,
        loading: loadingTasks,
        refetch: refetchTasks
    } = useQuery<{ tasks: Task[] }>(GET_TASKS);
    const tasks = taskData?.tasks;

    useEffect(() => {
        setShowGroupedTasks(!isNarrowScreen);
    }, [isNarrowScreen]);

    return (
        <Box sx={{ height: '100%', padding: 1, pt: 0, overflowY: 'auto', scrollbarGutter: 'none' }}>
            <CreateOrSelectTask
                title={inputText}
                onTitleChange={setInputText}
                submitTask={(task) => {
                    if (task.id) {
                        setOpenDetailsPanelEntity({
                            type: "Task",
                            id: task.id
                        });
                        setAdditionalTaskGroups(existingGroups => {
                            if (existingGroups[0]) {
                                const recentGroup: TaskGroup = existingGroups[0];
                                const tasksWithoutDupes = recentGroup.tasks.filter(t => t.id !== task.id);
                                const existingTasks2Max = tasksWithoutDupes.slice(0, 2);
                                return [
                                    {
                                        ...recentGroup,
                                        tasks: [task, ...existingTasks2Max]
                                    } as TaskGroup,
                                ]
                            } else {
                                return [
                                    {
                                        tasks: [task],
                                        name: "Recents",
                                        type: "RECENTS"
                                    } as TaskGroup
                                ];
                            }
                        });
                    }
                }}
                tasks={tasks}
                selectedTask={selectedTask}
                onTaskSelection={setSelectedTask}
                autocompleteProps={{
                    sx: { mb: 2 }
                }}
                textFieldProps={{
                    placeholder: "Search for a task",
                }}
            />
            {showGroupedTasks && (
                <GroupedTasks
                    {...{
                        setOpenDetailsPanelEntity,
                        setDraggedTask,
                        draggedTask,
                        additionalTaskGroups,
                    }}
                />
            )}
        </Box>
    );
};