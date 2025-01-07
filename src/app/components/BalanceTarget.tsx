import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_BALANCE_TARGETS } from "../lib/graphql/queries";
import { CreateBalanceTargetModal } from "./CreateBalanceTargetModal";

export const BalanceTargets = () => {
    const [open, setOpen] = useState(false);
    const { data: balanceTargetData, refetch: refetchBalanceTargets } = useQuery(GET_BALANCE_TARGETS);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    if (!balanceTargetData) {
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
                    <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mt: 2 }}>
                        Create Balance Target
                    </Button>
                </CardContent>
            </Card>
            <CreateBalanceTargetModal open={open} onClose={handleClose} refetchBalanceTargets={refetchBalanceTargets} />
        </Box>
    );
};
