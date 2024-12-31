/** @jsxImportSource @emotion/react */
import { Box, Typography, IconButton, Button, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent, ClickAwayListener } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_TASK_INSTANCE, UPDATE_TASK_INSTANCE } from "../lib/graphql/mutations";

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
    isMovingATask: boolean;
}

const cleanApolloEntity = (entity: any) => {
    const { __typename, ...cleanedEntity } = entity;
    return cleanedEntity;
};

export const TaskInstanceDetails = ({ taskInstance, onClose, refetchAllTaskData, isMovingATask }: TaskInstanceDetailsProps) => {
    const detailsRef = useRef<HTMLDivElement | null>(null);

    const [deleteTaskInstance] = useMutation(DELETE_TASK_INSTANCE);
    const [updateTaskInstance] = useMutation(UPDATE_TASK_INSTANCE);

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

    const createHandleStartChange = (key: "hour" | "minute") => async (event: SelectChangeEvent<number>) => {
        await updateTaskInstance({
            variables: {
                input: {
                    id: taskInstance.id,
                    start: {
                        ...cleanApolloEntity(taskInstance.start),
                        [key]: event.target.value,
                    },
                },
            },
        });
        await refetchAllTaskData();
    }

    const handleHourChange = createHandleStartChange("hour");

    const handleMinuteChange = createHandleStartChange("minute");

    const closeIfNotMoving = () => {
        if (!isMovingATask) {
            onClose();
        }
    }

    if (!taskInstance) {
        return null;
    }

    return (
        <ClickAwayListener onClickAway={closeIfNotMoving}>
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
                <Typography variant="body2">Start:</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
                    <FormControl variant="standard" sx={{ minWidth: 80 }} >
                        <InputLabel>Hour</InputLabel>
                        <Select
                            value={taskInstance.start.hour}
                            onChange={handleHourChange}
                            label="Hour"
                            size="small"
                            MenuProps={{ disablePortal: true }}
                        >
                            {Array.from({ length: 24 }, (_, i) => (
                                <MenuItem key={i} value={i}>
                                    {i}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Minutes</InputLabel>
                        <Select
                            value={taskInstance.start.minute}
                            onChange={handleMinuteChange}
                            label="Minutes"
                            size="small"
                            MenuProps={{ disablePortal: true }}
                        >
                            {[0, 15, 30, 45].map((minute) => (
                                <MenuItem key={minute} value={minute}>
                                    {minute.toString().padStart(2, "0")}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
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
        </ClickAwayListener>
    );
};
