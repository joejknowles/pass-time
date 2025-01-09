/** @jsxImportSource @emotion/react */
import { Box, Typography, IconButton, ClickAwayListener, Tabs, Tab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, useEffect, useRef } from "react";
import { Task } from "../dayGrid/types";
import { TaskDetailsGeneral } from "./TaskDetailsGeneral";
import { TaskDetailsSuggestions } from "./TaskDetailsSuggestions";

interface TaskInstanceDetailsProps {
    task: Task;
    tasks: Task[];
    onClose: () => void;
    refetchAllTaskData: () => void;
    isMovingATask: boolean;
    goBack?: () => void;
}

export const TaskDetails = ({
    task,
    tasks,
    refetchAllTaskData,
    isMovingATask,
    goBack,
    onClose,
}: TaskInstanceDetailsProps) => {
    const detailsRef = useRef<HTMLDivElement | null>(null);
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, isMovingATask]);

    if (!task) {
        return null;
    }

    const closeIfNotMoving = () => {
        if (!isMovingATask) {
            onClose();
        }
    };

    return (
        <ClickAwayListener onClickAway={closeIfNotMoving}>
            <Box
                ref={detailsRef}
                sx={{
                    backgroundColor: "white",
                    padding: 3,
                    width: "100%",
                    height: "100%",
                    position: "relative",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        display: "flex",
                        gap: 1,
                        zIndex: 10,
                    }}
                >
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        marginBottom: 3,
                        marginRight: "38px"
                    }}
                >
                    {goBack && (
                        <IconButton onClick={goBack}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6">{task.title}</Typography>
                </Box>
                <Tabs
                    value={tabIndex}
                    onChange={(_, newValue) => setTabIndex(newValue)}
                    sx={{ mb: 2 }}
                >
                    <Tab label="General" />
                    <Tab label="Suggestions / reminders" />
                </Tabs>
                {tabIndex === 0 && (
                    <TaskDetailsGeneral
                        task={task}
                        tasks={tasks}
                        refetchAllTaskData={refetchAllTaskData}
                    />
                )}
                {tabIndex === 1 && <TaskDetailsSuggestions />}
            </Box>
        </ClickAwayListener>
    );
};
