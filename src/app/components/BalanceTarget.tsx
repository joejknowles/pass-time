import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";

export const BalanceTargets = () => {
    const [balanceTargets, setBalanceTargets] = useState<string[]>([]);

    const handleCreateBalanceTarget = () => {
        // Logic to create a new balance target
        const newBalanceTarget = `Balance Target ${balanceTargets.length + 1}`;
        setBalanceTargets([...balanceTargets, newBalanceTarget]);
    };

    return (
        <Box sx={{ pt: '4px', width: "100%", maxWidth: "604px" }}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Balance Targets</Typography>
                    {balanceTargets.length === 0 ? (
                        <Typography variant="body2" color="textSecondary">
                            No balance targets yet. Click the button below to create one.
                        </Typography>
                    ) : (
                        <ul>
                            {balanceTargets.map((balanceTarget, index) => (
                                <li key={index}>{balanceTarget}</li>
                            ))}
                        </ul>
                    )}
                    <Button variant="contained" color="primary" onClick={handleCreateBalanceTarget} sx={{ mt: 2 }}>
                        Create Balance Target
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};
