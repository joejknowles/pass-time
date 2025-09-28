import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  ClickAwayListener,
} from "@mui/material";
import { DetailedTask, Task } from "../../dayGrid/types";
import { durationOptions } from "../../../lib/utils/durationOptions";
import { useTasks } from "@/app/lib/hooks/useTasks";
import { useEffect, useState } from "react";
import { TaskStats } from "./TaskDetailsActivityStats/TaskStats";

interface TaskDetailsGeneralProps {
  task: Task | DetailedTask;
  goToTaskDetails: (taskId: string) => void;
}

export const TaskDetailsGeneral = ({
  task,
  goToTaskDetails,
}: TaskDetailsGeneralProps) => {
  const {
    tasks,
    updateTask,
    updateError: taskUpdateErrorRaw,
    resetUpdateError,
  } = useTasks();
  const taskUpdateError = taskUpdateErrorRaw?.graphQLErrors[0];
  const genericErrorMessage =
    !taskUpdateError?.extensions?.fieldName && taskUpdateError?.message;
  const [isAddingParentTask, setIsAddingParentTask] = useState(false);
  const [isAddingChildTask, setIsAddingChildTask] = useState(false);

  const handleDurationChange = async (event: SelectChangeEvent<number>) => {
    if (event.target.value) {
      await updateTask(task.id, {
        defaultDuration: event.target.value as number,
      });
    }
  };

  const handleParentTaskChange = async (_e: any, selection: any) => {
    if (selection) {
      await updateTask(task.id, { parentTaskId: selection.id });
      setIsAddingParentTask(false);
    }
  };

  const handleChildTaskChange = async (_e: any, selection: any) => {
    if (selection) {
      await updateTask(task.id, { childTaskId: selection.id });
      setIsAddingChildTask(false);
    }
  };

  useEffect(() => {
    return () => {
      resetUpdateError();
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
      <Box>
        {genericErrorMessage && (
          <Typography variant="subtitle2" color="error" sx={{ mb: 2 }}>
            {genericErrorMessage}
          </Typography>
        )}
        <Box>
          <Typography variant="caption" color="textSecondary">
            Parent Tasks:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {task.parentTasks.map((parentTask) => (
                <Chip
                  key={parentTask.id}
                  label={parentTask.title}
                  size="small"
                  onClick={() => goToTaskDetails(parentTask.id)}
                />
              ))}
              {!isAddingParentTask &&
                taskUpdateError?.extensions?.fieldName !== "parentTaskId" && (
                  <Chip
                    label="+ Add"
                    size="small"
                    onClick={() => setIsAddingParentTask(true)}
                  />
                )}
            </Box>
            {(isAddingParentTask ||
              taskUpdateError?.extensions?.fieldName === "parentTaskId") && (
              <ClickAwayListener
                onClickAway={() => {
                  setTimeout(() => {
                    setIsAddingParentTask(false);
                    if (
                      taskUpdateError?.extensions?.fieldName === "parentTaskId"
                    ) {
                      resetUpdateError();
                    }
                  }, 100);
                }}
              >
                <Autocomplete
                  openOnFocus={
                    taskUpdateError?.extensions?.fieldName !== "parentTaskId"
                  }
                  options={
                    tasks?.map((task) => ({
                      label: task.title,
                      id: task.id,
                    })) || []
                  }
                  size="small"
                  onChange={handleParentTaskChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      autoFocus
                      label="Parent Task"
                      error={
                        taskUpdateError?.extensions?.fieldName ===
                        "parentTaskId"
                      }
                      helperText={
                        taskUpdateError?.extensions?.fieldName ===
                          "parentTaskId" && taskUpdateError.message
                      }
                    />
                  )}
                />
              </ClickAwayListener>
            )}
          </Box>
        </Box>
        <Box sx={{ marginTop: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Child Tasks:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {task.childTasks.map((childTask) => (
                <Chip
                  key={childTask.id}
                  label={childTask.title}
                  size="small"
                  onClick={() => goToTaskDetails(childTask.id)}
                />
              ))}
              {!isAddingChildTask &&
                taskUpdateError?.extensions?.fieldName !== "childTaskId" && (
                  <Chip
                    label="+ Add"
                    size="small"
                    onClick={() => setIsAddingChildTask(true)}
                  />
                )}
            </Box>
            {(isAddingChildTask ||
              taskUpdateError?.extensions?.fieldName === "childTaskId") && (
              <ClickAwayListener
                onClickAway={() => {
                  setTimeout(() => {
                    setIsAddingChildTask(false);
                    if (
                      taskUpdateError?.extensions?.fieldName === "childTaskId"
                    ) {
                      resetUpdateError();
                    }
                  }, 100);
                }}
              >
                <Autocomplete
                  openOnFocus={
                    taskUpdateError?.extensions?.fieldName !== "childTaskId"
                  }
                  options={
                    tasks?.map((task) => ({
                      label: task.title,
                      id: task.id,
                    })) || []
                  }
                  size="small"
                  onChange={handleChildTaskChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      autoFocus
                      label="Child Task"
                      error={
                        taskUpdateError?.extensions?.fieldName === "childTaskId"
                      }
                      helperText={
                        taskUpdateError?.extensions?.fieldName ===
                          "childTaskId" && taskUpdateError.message
                      }
                    />
                  )}
                />
              </ClickAwayListener>
            )}
          </Box>
        </Box>
        <Box sx={{ mt: 4 }}>
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
      <Box sx={{ mt: "auto" }}>
        <TaskStats task={task} />
      </Box>
    </Box>
  );
};
