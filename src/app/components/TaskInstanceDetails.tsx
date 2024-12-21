/** @jsxImportSource @emotion/react */
import { Box, Typography, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_TASK_INSTANCE } from "../lib/graphql/mutations";

interface TaskInstance {
    id: string;
    task: {
        title: string;
        userId: number;
    };
    start: {
        date: string;
        hour: number;
        minute: number;
    };
    duration: number;
}

interface TaskInstanceDetailsProps {
    taskInstance: TaskInstance;
    onClose: () => void;
    refetchAllTaskData: () => void;
}

export const TaskInstanceDetails = ({ taskInstance, onClose, refetchAllTaskData }: TaskInstanceDetailsProps) => {
    const detailsRef = useRef<HTMLDivElement | null>(null);

    const [deleteTaskInstance, { error: errorFromDeletingTaskInstance }] = useMutation(DELETE_TASK_INSTANCE);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    if (!taskInstance) {
        return null;
    }

    return (
        <Box
            ref={detailsRef}
            sx={{
                backgroundColor: "white",
                padding: 2,
                width: "100%",
                height: "100%",
                position: "relative",
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 10,
                }}
            >
                <CloseIcon />
            </IconButton>
            <Typography variant="h6">{taskInstance.task.title}</Typography>
            <Typography variant="body2">
                Start: {taskInstance.start.date} at {taskInstance.start.hour}:{taskInstance.start.minute.toString().padStart(2, "0")}
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: "8px" }}>
                Duration: {taskInstance.duration} minutes
            </Typography>

            <Button
                variant="contained"
                color="primary"
                sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    zIndex: 10,
                }}
                onClick={async () => {
                    await deleteTaskInstance({ variables: { id: taskInstance.id } });
                    await refetchAllTaskData();
                    onClose();
                }}
            >
                Delete
            </Button>
        </Box>
    );
};
