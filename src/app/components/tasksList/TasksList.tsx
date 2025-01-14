import { Box } from "@mui/material";
import { OpenDetailsPanelEntity, Task } from "../dayGrid/types";
import { GroupedTasks } from "./GroupedTasks";
import { BasicTask } from "./types";


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
    return (
        <Box sx={{ height: '100%', padding: 1, overflowY: 'auto', scrollbarGutter: 'none' }}>
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