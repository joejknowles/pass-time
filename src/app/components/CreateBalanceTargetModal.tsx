import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Typography,
  Autocomplete,
} from "@mui/material";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_BALANCE_TARGET } from "../lib/graphql/mutations";
import { GET_TASKS } from "../lib/graphql/queries";
import { durationOptions } from "../lib/utils/durationOptions";

interface CreateBalanceTargetModalProps {
  open: boolean;
  onClose: () => void;
  refetchBalanceTargets: () => void;
}

export const CreateBalanceTargetModal = ({
  open,
  onClose,
  refetchBalanceTargets,
}: CreateBalanceTargetModalProps) => {
  const [newTarget, setNewTarget] = useState({
    timeWindow: "DAILY",
    taskId: "",
    targetAmount: 30,
  });
  const [createBalanceTarget, { loading, error: createBalanceTargetError }] =
    useMutation(CREATE_BALANCE_TARGET);
  const { data: taskData } = useQuery(GET_TASKS);
  const [taskError, setTaskError] = useState<string | null>(null);

  const handleCreateBalanceTarget = async () => {
    if (!newTarget.taskId) {
      setTaskError("Task is required");
      return;
    }
    setTaskError(null);
    await createBalanceTarget({
      variables: {
        input: {
          timeWindow: newTarget.timeWindow,
          taskId: parseInt(newTarget.taskId, 10),
          targetAmount: newTarget.targetAmount,
        },
      },
    });
    refetchBalanceTargets();
    setNewTarget({ timeWindow: "DAILY", taskId: "", targetAmount: 30 });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ width: 350, maxWidth: "100%" }}>
        <DialogTitle>Create Target</DialogTitle>
        <DialogContent>
          {createBalanceTargetError && (
            <Typography variant="subtitle2" color="error">
              {createBalanceTargetError.message}
            </Typography>
          )}
          <TextField
            select
            label="Time Window"
            value={newTarget.timeWindow}
            onChange={(e) =>
              setNewTarget({ ...newTarget, timeWindow: e.target.value })
            }
            fullWidth
            margin="normal"
            disabled={loading}
          >
            <MenuItem value="DAILY">Daily</MenuItem>
            <MenuItem value="WEEKLY">Weekly</MenuItem>
          </TextField>
          <Autocomplete
            options={
              taskData?.tasks.map((task: any) => ({
                label: task.title,
                id: task.id,
              })) || []
            }
            onChange={(_e, selection: { id: string; label: string } | null) =>
              setNewTarget({ ...newTarget, taskId: selection?.id || "" })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Task"
                fullWidth
                margin="normal"
                disabled={loading}
                error={!!taskError}
                helperText={taskError}
              />
            )}
          />
          <TextField
            select
            label="Target Amount"
            value={newTarget.targetAmount}
            onChange={(e) =>
              setNewTarget({
                ...newTarget,
                targetAmount: parseInt(e.target.value, 10),
              })
            }
            fullWidth
            margin="normal"
            disabled={loading}
            slotProps={{
              select: {
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 250,
                    },
                  },
                },
              },
            }}
          >
            {durationOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateBalanceTarget}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Create
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
