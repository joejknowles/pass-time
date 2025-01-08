/** @jsxImportSource @emotion/react */
import { Box, Typography, IconButton, ClickAwayListener, TextField, Autocomplete, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
    goBack?: () => void;
}

export const TaskDetails = ({
    task,
    tasks,
    onClose,
    refetchAllTaskData,
    isMovingATask,
    goBack,
}: TaskInstanceDetailsProps) => {
    const detailsRef = useRef<HTMLDivElement | null>(null);

    const [updateTask, { error: taskUpdateErrorRaw }] = useMutation(UPDATE_TASK);
    const taskUpdateError = taskUpdateErrorRaw?.graphQLErrors[0];
    const genericErrorMessage = !taskUpdateError?.extensions?.fieldName && taskUpdateError?.message || taskUpdateErrorRaw?.message;

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
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        marginBottom: 3,
                        marginRight: "38px"
                    }}
                >
                    {
                        goBack &&
                        <IconButton
                            onClick={goBack}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    }
                    <Typography variant="h6">
                        {task.title}
                    </Typography>
                </Box>
                {genericErrorMessage && (
                    <Typography variant="subtitle2" color="error">
                        {genericErrorMessage}
                    </Typography>
                )}
                <Autocomplete
                    options={tasks.map((task) => ({ label: task.title, id: task.id }))}
                    size="small"
                    onChange={async (_e, selection) => {
                        if (selection) {
                            await updateTask({
                                variables: {
                                    input: {
                                        id: task.id,
                                        parentTaskId: selection.id,
                                    },
                                },
                            });
                            await refetchAllTaskData();
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Parent Task"
                            variant="standard"
                            error={taskUpdateError?.extensions?.fieldName === "parentTaskId"}
                            helperText={taskUpdateError?.extensions?.fieldName === "parentTaskId" && taskUpdateError.message}
                        />
                    )}
                />
                {task.parentTasks.length > 0 && (
                    <Box sx={{ marginTop: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Parent Tasks:
                        </Typography>
                        {task.parentTasks.map((parentTask) => (
                            <Chip key={parentTask.id} label={parentTask.title} size="small" sx={{ marginRight: 1, marginTop: 1 }} />
                        ))}
                    </Box>
                )}
                {task.childTasks.length > 0 && (
                    <Box sx={{ marginTop: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Child Tasks:
                        </Typography>
                        {task.childTasks.map((childTask) => (
                            <Chip key={childTask.id} label={childTask.title} size="small" sx={{ marginRight: 1, marginTop: 1 }} />
                        ))}
                    </Box>
                )}
            </Box>
        </ClickAwayListener>
    );
};
