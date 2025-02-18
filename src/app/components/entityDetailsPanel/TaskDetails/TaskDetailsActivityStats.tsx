import { Box, Typography, Autocomplete, TextField, Chip, Select, MenuItem, SelectChangeEvent, FormControl, InputLabel, ClickAwayListener, Button, Link, duration } from "@mui/material";
import { DetailedTask, Task } from "../../dayGrid/types";
import { durationOptions } from "../../../lib/utils/durationOptions";
import { useTasks } from "@/app/lib/hooks/useTasks";
import { useState } from "react";
import { displayMinutes } from "../../utils/date";
import { TaskStats } from './TaskStats';

interface TaskDetailsActivityStatsProps {
    task: Task | DetailedTask;
}

export const TaskDetailsActivityStats = ({ task }: TaskDetailsActivityStatsProps) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
            <Box>

                <TaskStats task={task} />
            </Box>
        </Box>
    );
};
