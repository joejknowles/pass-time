import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_BALANCE_TARGET, GET_TASKS } from "../lib/graphql/mutations";

interface CreateBalanceTargetModalProps {
    open: boolean;
    onClose: () => void;
    refetchBalanceTargets: () => void;
}

export const CreateBalanceTargetModal = ({ open, onClose, refetchBalanceTargets }: CreateBalanceTargetModalProps) => {
    const [newTarget, setNewTarget] = useState({ timeWindow: 'DAILY', taskId: '', targetAmount: '30' });
    const [createBalanceTarget, { loading, error: createBalanceTargetError }] = useMutation(CREATE_BALANCE_TARGET);
    const { data: taskData } = useQuery(GET_TASKS);

    const handleCreateBalanceTarget = async () => {
        await createBalanceTarget({
            variables: {
                input: {
                    timeWindow: newTarget.timeWindow,
                    taskId: parseInt(newTarget.taskId, 10),
                    targetAmount: parseInt(newTarget.targetAmount, 10),
                },
            },
        });
        refetchBalanceTargets();
        setNewTarget({ timeWindow: 'DAILY', taskId: '', targetAmount: '30' });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Create Balance Target</DialogTitle>
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
                    onChange={(e) => setNewTarget({ ...newTarget, timeWindow: e.target.value })}
                    fullWidth
                    margin="normal"
                    disabled={loading}
                >
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                </TextField>
                <TextField
                    select={taskData?.tasks.length > 0}
                    disabled={!taskData || taskData?.tasks.length === 0 || loading}
                    label="Task"
                    value={newTarget.taskId}
                    onChange={(e) => setNewTarget({ ...newTarget, taskId: e.target.value })}
                    fullWidth
                    margin="normal"
                >
                    {taskData?.tasks.map((task: any) => (
                        <MenuItem key={task.id} value={task.id}>
                            {task.title}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Target Amount (in minutes)"
                    value={newTarget.targetAmount}
                    onChange={(e) => setNewTarget({ ...newTarget, targetAmount: e.target.value })}
                    fullWidth
                    margin="normal"
                    type="number"
                    disabled={loading}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleCreateBalanceTarget} variant="contained" color="primary" disabled={loading}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};
