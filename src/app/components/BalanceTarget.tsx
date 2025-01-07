import { Box, Button, Card, CardContent, Typography, TextField, MenuItem } from "@mui/material";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_BALANCE_TARGET, GET_TASKS } from "../lib/graphql/mutations";
import { GET_BALANCE_TARGETS } from "../lib/graphql/queries";

export const BalanceTargets = () => {
    const [newTarget, setNewTarget] = useState({ timeWindow: 'DAILY', taskId: '', targetAmount: '30' });
    const [createBalanceTarget] = useMutation(CREATE_BALANCE_TARGET);
    const { data: taskData } = useQuery(GET_TASKS);
    const { data: balanceTargetData, refetch: refetchBalanceTargets } = useQuery(GET_BALANCE_TARGETS);

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
    };

    if (!taskData || !balanceTargetData) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ pt: '4px', width: "100%", maxWidth: "604px" }}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Balance Targets</Typography>
                    {balanceTargetData?.balanceTargets.length === 0 ? (
                        <Typography variant="body2" color="textSecondary">
                            No balance targets yet. Create one below.
                        </Typography>
                    ) : (
                        <ul>
                            {balanceTargetData?.balanceTargets.map((balanceTarget: any, index: number) => (
                                <li key={index}>
                                    {balanceTarget.timeWindow} target for task "{balanceTarget.task.title}" with amount {balanceTarget.targetAmount}
                                </li>
                            ))}
                        </ul>
                    )}
                    <TextField
                        select
                        label="Time Window"
                        value={newTarget.timeWindow}
                        onChange={(e) => setNewTarget({ ...newTarget, timeWindow: e.target.value })}
                        fullWidth
                        margin="normal"
                    >
                        <MenuItem value="DAILY">Daily</MenuItem>
                        <MenuItem value="WEEKLY">Weekly</MenuItem>
                    </TextField>
                    <TextField
                        select={taskData?.tasks.length > 0}
                        disabled={!taskData || taskData?.tasks.length === 0}
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
                    />
                    <Button variant="contained" color="primary" onClick={handleCreateBalanceTarget} sx={{ mt: 2 }}>
                        Create Balance Target
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};
