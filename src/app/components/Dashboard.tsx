import { Box, Container, useMediaQuery } from "@mui/material";
import { DayCalendar } from "./dayGrid/DayCalendar";
import { Tasks } from "./Tasks";
import { withSignedInLayout } from "./SignedInLayout";
import { useState } from "react";
import { OpenDetailsPanelEntity } from "./dayGrid/types";

const Dashboard = () => {
    const isNarrowScreen = useMediaQuery("(max-width:710px)");

    const [openDetailsPanelEntity, setOpenDetailsPanelEntityRaw] = useState<OpenDetailsPanelEntity | null>(null);
    const setOpenDetailsPanelEntity = (newOpenEntity: OpenDetailsPanelEntity | null) => {
        setOpenDetailsPanelEntityRaw(newOpenEntity);
        if (newOpenEntity?.type === "TaskInstance" && isNarrowScreen) {
            const taskInstanceCard = document.getElementById(`task-instance-calendar-card-${newOpenEntity.id}`);
            if (taskInstanceCard) {
                const topOffset = taskInstanceCard.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2) + 100;
                window.scrollTo({ top: topOffset, behavior: 'smooth' });
            }
        }
    }

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
                            <Tasks
                                setOpenDetailsPanelEntity={setOpenDetailsPanelEntity}
                            />
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
                    <DayCalendar
                        openDetailsPanelEntity={openDetailsPanelEntity}
                        setOpenDetailsPanelEntity={setOpenDetailsPanelEntity}
                    />
                    {
                        isNarrowScreen && (
                            <Box sx={{ mt: 2 }}>
                                <Tasks
                                    setOpenDetailsPanelEntity={setOpenDetailsPanelEntity}
                                />
                            </Box>
                        )
                    }
                </Box>
            </Box>
        </Container>
    );
};

export default withSignedInLayout(Dashboard);
