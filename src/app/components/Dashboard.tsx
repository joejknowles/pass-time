import { Box, Container, useMediaQuery } from "@mui/material";
import { DayCalendar } from "./dayGrid/DayCalendar";
import { TasksList } from "./tasksList/TasksList";
import { withSignedInLayout } from "./SignedInLayout";
import { useState } from "react";
import { OpenDetailsPanelEntity, Task } from "./dayGrid/types";
import { BasicTask } from "./tasksList/types";

interface DraggedTask {
    task: BasicTask | Task;
    position: { x: number, y: number };
    width: number;
}

const Dashboard = () => {
    const isNarrowScreen = useMediaQuery("(max-width:710px)");

    const [openDetailsPanelEntity, setOpenDetailsPanelEntityRaw] = useState<OpenDetailsPanelEntity | null>(null);
    const [draggedTask, setDraggedTask] = useState<DraggedTask | null>(null);

    const setOpenDetailsPanelEntity = (newOpenEntity: OpenDetailsPanelEntity | null) => {
        setOpenDetailsPanelEntityRaw(newOpenEntity);
        if (newOpenEntity?.type === "TaskInstance" && isNarrowScreen) {
            let taskInstanceCard = document.getElementById(`task-instance-calendar-card-${newOpenEntity.id}`);
            if (!taskInstanceCard) {
                taskInstanceCard = document.getElementById('new-task-instance-calendar-card');
            }
            if (taskInstanceCard) {
                const topOffset = taskInstanceCard.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2) + 100;
                window.scrollTo({ top: topOffset, behavior: 'smooth' });
            }
        }
    }

    return (
        <Container sx={{
            mt: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexGrow: 1,
            ...(
                isNarrowScreen ? {} : { overflow: "hidden" }
            )
        }}>
            <Box
                sx={{
                    width: "100%",
                    mb: 2,
                    ...(
                        isNarrowScreen
                            ? undefined
                            : {
                                display: "flex",
                                flexGrow: 1,
                                justifyContent: "center",
                                overflow: "hidden",
                            }
                    )
                }

                }
            >
                <Box sx={{
                    maxWidth: isNarrowScreen ? undefined : "380px",
                    minWidth: 0,
                    flexGrow: 1,
                    flexShrink: 5,
                    p: 2
                }}>
                    <TasksList
                        setOpenDetailsPanelEntity={setOpenDetailsPanelEntity}
                        setDraggedTask={setDraggedTask}
                        draggedTask={draggedTask}
                    />
                </Box>
                {!isNarrowScreen && (
                    <Box
                        sx={{
                            width: "1px",
                            bgcolor: "grey.200",
                        }}
                    />
                )}

                <Box
                    sx={{
                        flexGrow: 1,
                        flexShrink: 1,
                        p: 2,
                        maxWidth: isNarrowScreen ? undefined : "400px",
                        minWidth: "MIN(360px, 100%)",
                    }}
                >
                    <DayCalendar
                        openDetailsPanelEntity={openDetailsPanelEntity}
                        setOpenDetailsPanelEntity={setOpenDetailsPanelEntity}
                        draggedTask={draggedTask}
                        setDraggedTask={setDraggedTask}
                    />
                </Box>
            </Box>
        </Container>
    );
};

export default withSignedInLayout(Dashboard);
