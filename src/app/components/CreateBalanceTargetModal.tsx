import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_BALANCE_TARGET, GET_TASKS } from "../lib/graphql/mutations";

interface CreateBalanceTargetModalProps {
    open: boolean;
    onClose: () => void;
    refetchBalanceTargets: () => void;
}

const displayMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}hr${hours > 1 ? 's' : ''} ` : ''}${mins > 0 ? `${mins}min${mins > 1 ? 's' : ''}` : ''}`.trim();
};

const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const minutes = (i + 1) * 15;
    return { label: displayMinutes(minutes), value: minutes };
});

export const CreateBalanceTargetModal = ({ open, onClose, refetchBalanceTargets }: CreateBalanceTargetModalProps) => {
    const [newTarget, setNewTarget] = useState({ timeWindow: 'DAILY', taskId: '', targetAmount: 30 });
    const [createBalanceTarget, { loading, error: createBalanceTargetError }] = useMutation(CREATE_BALANCE_TARGET);
    const { data: taskData } = useQuery(GET_TASKS);

    const handleCreateBalanceTarget = async () => {
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
        setNewTarget({ timeWindow: 'DAILY', taskId: '', targetAmount: 30 });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <Box sx={{ width: 350, maxWidth: "100%" }}>
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
                        select
                        label="Target Amount"
                        value={newTarget.targetAmount}
                        onChange={(e) => setNewTarget({ ...newTarget, targetAmount: parseInt(e.target.value, 10) })}
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
                        {timeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleCreateBalanceTarget} variant="contained" color="primary" disabled={loading}>
                        Create
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};
