/** @jsxImportSource @emotion/react */
import { Box, Typography, IconButton, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent, ClickAwayListener, Menu, useMediaQuery, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_TASK } from "../../lib/graphql/mutations";
import { Task } from "../dayGrid/types";

interface TaskInstanceDetailsProps {
    task: Task;
    tasks: Task[];
    onClose: () => void;
    refetchAllTaskData: () => void;
    isMovingATask: boolean;
}

export const TaskDetails = ({
    task,
    tasks,
    onClose,
    refetchAllTaskData,
    isMovingATask,
}: TaskInstanceDetailsProps) => {
    const detailsRef = useRef<HTMLDivElement | null>(null);

    const [updateTask] = useMutation(UPDATE_TASK);

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
    }


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
                    <IconButton
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Typography variant="h6"
                    sx={{ marginBottom: 3, marginRight: "38px" }}
                >
                    {task.title}
                </Typography>
            </Box>
        </ClickAwayListener>
    );
};
