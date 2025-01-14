import { Box } from "@mui/material";
import { OpenDetailsPanelEntity, Task } from "../dayGrid/types";
import { GroupedTasks } from "./GroupedTasks";
import { BasicTask } from "./types";
import CreateOrSelectTask from "../dayGrid/CreateOrSelectTask";
import { useState } from "react";
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
    const [inputText, setInputText] = useState("");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const {
        data: taskData,
        error: errorFromGetTasks,
        loading: loadingTasks,
        refetch: refetchTasks
    } = useQuery<{ tasks: Task[] }>(GET_TASKS);
    const tasks = taskData?.tasks;

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
            <GroupedTasks
                {...{
                    setOpenDetailsPanelEntity,
                    setDraggedTask,
                    draggedTask,
                }}
            />
        </Box>
    );
};