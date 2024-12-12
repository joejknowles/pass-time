
import { Box, Container } from "@mui/material";
import { Tasks } from "./Tasks";
import { DayGrid } from "./DayGrid";

export const Dashboard = () => {
    return (
        <Container sx={{ mt: 4 }}>
            <Box
                sx={{
                    display: "flex",
                    height: "80vh",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        width: "250px",
                        p: 2,
                    }}
                >
                    <Tasks />
                </Box>
                <Box
                    sx={{
                        width: "1px",
                        bgcolor: "grey.200",
                    }}
                />
                <Box
                    sx={{
                        flexGrow: 1,
                        p: 2,
                        maxWidth: "400px",
                    }}
                >
                    <DayGrid />
                </Box>
            </Box>
        </Container>
    );
};