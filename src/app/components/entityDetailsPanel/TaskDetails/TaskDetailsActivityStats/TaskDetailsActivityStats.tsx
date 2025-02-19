import { Box } from "@mui/material";
import { DetailedTask, Task } from "../../../dayGrid/types";
import { TaskStats } from './TaskStats';
import { TaskStatsChart } from "./TaskStatsChart";

interface TaskDetailsActivityStatsProps {
    task: Task | DetailedTask;
}

export const TaskDetailsActivityStats = ({ task }: TaskDetailsActivityStatsProps) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
            <Box>
                <TaskStatsChart task={task} />
            </Box>
            <Box>
                <TaskStats task={task} />
            </Box>
        </Box>
    );
};
