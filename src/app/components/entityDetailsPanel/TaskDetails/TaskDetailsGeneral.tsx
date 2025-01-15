import { Box, Typography, Autocomplete, TextField, Chip, Select, MenuItem, SelectChangeEvent, FormControl, InputLabel } from "@mui/material";
import { Task } from "../../dayGrid/types";
import { durationOptions } from "../../../lib/utils/durationOptions";
import { useTasks } from "@/app/lib/hooks/useTasks";

interface TaskDetailsGeneralProps {
    task: Task;
}

export const TaskDetailsGeneral = ({ task }: TaskDetailsGeneralProps) => {
    const { tasks, updateTask, error: taskUpdateErrorRaw } = useTasks();
    const taskUpdateError = taskUpdateErrorRaw?.graphQLErrors[0];
    const genericErrorMessage = !taskUpdateError?.extensions?.fieldName && taskUpdateError?.message || taskUpdateErrorRaw?.message;

    const handleDurationChange = async (event: SelectChangeEvent<number>) => {
        if (event.target.value) {
            await updateTask(task.id, { defaultDuration: event.target.value as number });
        }
    };

    const handleParentTaskChange = async (_e: any, selection: any) => {
        if (selection) {
            await updateTask(task.id, { parentTaskId: selection.id });
        }
    };

    return (
        <Box>
            {genericErrorMessage && (
                <Typography variant="subtitle2" color="error">
                    {genericErrorMessage}
                </Typography>
            )}
            <Autocomplete
                options={tasks?.map((task) => ({ label: task.title, id: task.id })) || []}
                size="small"
                onChange={handleParentTaskChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Parent Task"
                        error={taskUpdateError?.extensions?.fieldName === "parentTaskId"}
                        helperText={taskUpdateError?.extensions?.fieldName === "parentTaskId" && taskUpdateError.message}
                    />
                )}
            />
            {task.parentTasks.length > 0 && (
                <Box sx={{ marginTop: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Parent Tasks:
                    </Typography>
                    {task.parentTasks.map((parentTask) => (
                        <Chip key={parentTask.id} label={parentTask.title} size="small" sx={{ marginRight: 1, marginTop: 1 }} />
                    ))}
                </Box>
            )}
            {task.childTasks.length > 0 && (
                <Box sx={{ marginTop: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Child Tasks:
                    </Typography>
                    {task.childTasks.map((childTask) => (
                        <Chip key={childTask.id} label={childTask.title} size="small" sx={{ marginRight: 1, marginTop: 1 }} />
                    ))}
                </Box>
            )}
            <Box sx={{ marginTop: 2 }}>
                <FormControl sx={{ minWidth: 150 }} variant="outlined">
                    <InputLabel id="duration-label">Default duration</InputLabel>
                    <Select
                        labelId="duration-label"
                        label="Default duration"
                        value={task.defaultDuration}
                        onChange={handleDurationChange}
                        MenuProps={{
                            disablePortal: true,
                            sx: {
                                maxHeight: 350,
                            },
                        }}
                    >
                        {durationOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
};
