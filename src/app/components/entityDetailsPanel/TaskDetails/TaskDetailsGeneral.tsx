import { Box, Typography, Autocomplete, TextField, Chip, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { useMutation } from "@apollo/client";
import { UPDATE_TASK } from "../../../lib/graphql/mutations";
import { Task } from "../../dayGrid/types";
import { durationOptions } from "../../../lib/utils/durationOptions";

interface TaskDetailsGeneralProps {
    task: Task;
    tasks: Task[];
    refetchAllTaskData: () => void;
}

export const TaskDetailsGeneral = ({ task, tasks, refetchAllTaskData }: TaskDetailsGeneralProps) => {
    const [updateTask, { error: taskUpdateErrorRaw }] = useMutation(UPDATE_TASK);
    const taskUpdateError = taskUpdateErrorRaw?.graphQLErrors[0];
    const genericErrorMessage = !taskUpdateError?.extensions?.fieldName && taskUpdateError?.message || taskUpdateErrorRaw?.message;

    const handleDurationChange = async (event: SelectChangeEvent<number>) => {
        await updateTask({
            variables: {
                input: {
                    id: task.id,
                    defaultDuration: event.target.value,
                },
            },
        });
        await refetchAllTaskData();
    };

    return (
        <Box>
            {genericErrorMessage && (
                <Typography variant="subtitle2" color="error">
                    {genericErrorMessage}
                </Typography>
            )}
            <Autocomplete
                options={tasks.map((task) => ({ label: task.title, id: task.id }))}
                size="small"
                onChange={async (_e, selection) => {
                    if (selection) {
                        await updateTask({
                            variables: {
                                input: {
                                    id: task.id,
                                    parentTaskId: selection.id,
                                },
                            },
                        });
                        await refetchAllTaskData();
                    }
                }}
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
                <Select
                    label="Default duration"
                    value={task.defaultDuration}
                    onChange={handleDurationChange}
                    sx={{
                        minWidth: 150,
                    }}
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
            </Box>
        </Box>
    );
};
