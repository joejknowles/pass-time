import { Box } from "@mui/material";
import { OpenDetailsPanelEntity, Task } from "../dayGrid/types";
import { GroupedTasks } from "./GroupedTasks";
import { BasicTask, TaskGroup } from "./types";
import CreateOrSelectTask from "../dayGrid/CreateOrSelectTask";
import { useEffect, useState } from "react";
import { useTasks } from "@/app/lib/hooks/useTasks";
import { useDevice } from "@/app/lib/hooks/useDevice";

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
    const { isPhabletWidthOrLess } = useDevice();
    const [showGroupedTasks, setShowGroupedTasks] = useState(!isPhabletWidthOrLess);
    const [inputText, setInputText] = useState("");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [additionalTaskGroups, setAdditionalTaskGroups] = useState<TaskGroup[]>([]);
    const { tasks, createTask } = useTasks();

    useEffect(() => {
        setShowGroupedTasks(!isPhabletWidthOrLess);
    }, [isPhabletWidthOrLess]);

    return (
        <Box sx={{ height: '100%', padding: 1, pt: 0, overflowY: 'auto', scrollbarGutter: 'none' }}>
            <CreateOrSelectTask
                title={inputText}
                onTitleChange={setInputText}
                submitTask={async (task) => {
                    setInputText("");
                    setSelectedTask(null);
                    if (task.id) {
                        const submittedTask = tasks?.find(t => t.id === task.id);
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
                                        tasks: [submittedTask, ...existingTasks2Max]
                                    } as TaskGroup,
                                ]
                            } else {
                                return [
                                    {
                                        tasks: [submittedTask],
                                        name: "Recents",
                                        type: "RECENTS"
                                    } as TaskGroup
                                ];
                            }
                        });
                    } else if (task.title) {
                        const newTask = await createTask(task.title);
                        setAdditionalTaskGroups(existingGroups => {
                            if (existingGroups[0]) {
                                const recentGroup: TaskGroup = existingGroups[0];
                                const existingTasks2Max = recentGroup.tasks.slice(0, 2);
                                return [
                                    {
                                        ...recentGroup,
                                        tasks: [newTask, ...existingTasks2Max]
                                    } as TaskGroup,
                                ]
                            } else {
                                return [
                                    {
                                        tasks: [newTask],
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