import { Box, Container, useMediaQuery } from "@mui/material";
import { DayGrid } from "./dayGrid/DayGrid";
import { Tasks } from "./Tasks";
import { withSignedInLayout } from "./SignedInLayout";

const Dashboard = () => {
    const isNarrowScreen = useMediaQuery("(max-width:710px)");

    return (
        <Container sx={{ mt: 4 }}>
            <Box
                sx={
                    isNarrowScreen
                        ? undefined
                        : {
                              display: "flex",
                              height: "80vh",
                              justifyContent: "center",
                          }
                }
            >
                {!isNarrowScreen && (
                    <>
                        <Box sx={{ width: "250px", p: 2 }}>
                            <Tasks />
                        </Box>
                        <Box
                            sx={{
                                width: "1px",
                                bgcolor: "grey.200",
                            }}
                        />
                    </>
                )}
                <Box
                    sx={{
                        flexGrow: 1,
                        p: 2,
                        maxWidth: isNarrowScreen ? undefined : "400px",
                    }}
                >
                    <DayGrid />
                </Box>
            </Box>
        </Container>
    );
};

export default withSignedInLayout(Dashboard);
