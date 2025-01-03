/** @jsxImportSource @emotion/react */
import { Autocomplete, Box, ClickAwayListener, TextField, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Task } from "@prisma/client";

interface DraftTaskInstance {
    title: string;
    start: {
        date: string;
        hour: number;
        minute: number;
    };
    duration: number;
    taskId?: number;
}

const daytimeHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const HOUR_COLUMN_WIDTH = 50;

export const DraftTaskInstanceCard = ({
    draftTaskInstance,
    setDraftTaskInstance,
    finalizeTaskInstance,
    tasks,
    isSubmittingTaskInstance
}: {
    draftTaskInstance: DraftTaskInstance,
    setDraftTaskInstance: (task: DraftTaskInstance | null) => void,
    finalizeTaskInstance: (task: DraftTaskInstance) => void,
    tasks?: Task[],
    isSubmittingTaskInstance?: boolean,
}) => {
    const thisRootRef = useRef<HTMLDivElement>(null);
    const isSubmittingWithOnChangeCallback = useRef(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        const cancelDraftsOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setDraftTaskInstance(null);
            }
        };
        setTimeout(() => {
            window.addEventListener("keydown", cancelDraftsOnEscape);
        }, 100);

        return () => {
            window.removeEventListener("keydown", cancelDraftsOnEscape);
        };
    }, []);

    return (
        <ClickAwayListener onClickAway={(e) => {
            e.preventDefault();
            setDraftTaskInstance(null);
        }}>
            <Box
                sx={{
                    position: "absolute",
                    top: `CALC(1px + ${(((draftTaskInstance.start.hour - daytimeHours[0]) * 60 + draftTaskInstance.start.minute) / (daytimeHours.length * 60)) * 100}%)`,
                    height: `CALC(${((draftTaskInstance.duration) / (daytimeHours.length * 60)) * 100}% - 1px)`,
                    left: HOUR_COLUMN_WIDTH + 16,
                    right: 16,
                    backgroundColor: "rgba(4, 70, 190, 0.9)",
                    borderRadius: "4px",
                    padding: "0 4px",
                    boxSizing: "border-box",
                    boxShadow: "2px 2px 10px 1px rgba(123, 158, 206, 0.9)"
                }}
                ref={thisRootRef}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Autocomplete
                        key={`${draftTaskInstance.start.date}:${draftTaskInstance.start.hour}:${draftTaskInstance.start.minute}`}
                        value={selectedTask && { label: selectedTask.title, id: selectedTask.id }}
                        disablePortal
                        disabled={isSubmittingTaskInstance}
                        autoFocus
                        openOnFocus
                        options={tasks?.map((task) => ({ label: task.title, id: task.id })) || []}
                        size="small"
                        onInputChange={(_e, value, reason) => {
                            if (reason === "input") {
                                setDraftTaskInstance({
                                    ...draftTaskInstance,
                                    title: value,
                                });
                                if (selectedTask && selectedTask.title !== value) {
                                    setSelectedTask(null);
                                }
                            }
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        slotProps={{
                            listbox: {
                                sx: {
                                    maxHeight: 300,
                                },
                            },
                        }}
                        inputValue={draftTaskInstance.title}
                        onChange={(_e, selection) => {
                            if (selection) {
                                setSelectedTask(tasks?.find((task) => task.id === selection?.id) || null);

                                const newTask = {
                                    ...draftTaskInstance,
                                    title: selection?.label || draftTaskInstance.title,
                                    taskId: selection?.id,
                                };
                                setDraftTaskInstance(newTask);

                                isSubmittingWithOnChangeCallback.current = true;
                                finalizeTaskInstance(newTask);
                            }
                        }}
                        noOptionsText="Press Enter to create a new task"
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                value={draftTaskInstance.title}
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "none",
                                    },
                                    "& .MuiInput-underline:hover:before": {
                                        borderBottom: "none !important",
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "none",
                                    },
                                }}
                                variant="standard"
                                autoFocus
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        setTimeout(() => {
                                            if (isSubmittingWithOnChangeCallback.current) {
                                                return;
                                            }

                                            const perfectOption = tasks
                                                ?.find((task) =>
                                                    task.title.toLowerCase() === draftTaskInstance.title.toLowerCase()
                                                );
                                            let newTask = draftTaskInstance;

                                            if (perfectOption) {
                                                newTask = {
                                                    ...newTask,
                                                    taskId: perfectOption.id,
                                                };
                                            }

                                            setDraftTaskInstance(newTask);
                                            finalizeTaskInstance(newTask);
                                        }, 100);
                                        event.preventDefault();
                                    } else if (event.key === "Tab") {
                                        const firstMatchingTask = tasks?.find((task) =>
                                            task.title.toLowerCase().includes(draftTaskInstance.title.toLowerCase())
                                        );
                                        if (firstMatchingTask && firstMatchingTask.title !== draftTaskInstance.title) {
                                            setDraftTaskInstance({
                                                ...draftTaskInstance,
                                                title: firstMatchingTask.title,
                                                taskId: firstMatchingTask.id,
                                            });
                                            setSelectedTask(firstMatchingTask);
                                            event.preventDefault();
                                        }
                                    }
                                }}
                            />
                        )}
                        sx={{
                            flexGrow: 1,
                            "& .MuiAutocomplete-inputRoot": {
                                color: "white",
                                "WebkitTextFillColor": "white !important",
                            },
                            "& .MuiAutocomplete-listbox": {
                                backgroundColor: "rgba(63, 81, 181, 0.9)",
                            },
                            "& .MuiAutocomplete-endAdornment .MuiButtonBase-root": {
                                color: "white",
                                "WebkitTextFillColor": "white !important",
                            },
                            "& .MuiInputBase-input.Mui-disabled, & .MuiAutocomplete-inputRoot.Mui-disabled": {
                                color: "white !important",
                                "WebkitTextFillColor": "white !important",
                            },
                            "& .MuiAutocomplete-endAdornment .MuiButtonBase-root.Mui-disabled": {
                                color: "white",
                            },
                            "& .MuiInput-underline:before, & .MuiInput-underline:hover:before, & .MuiInput-underline:after, & .MuiInput-underline.Mui-disabled:before": {
                                borderBottom: "none !important",
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        disabled={isSubmittingTaskInstance}
                        sx={{
                            marginLeft: 1,
                            backgroundColor: "#f0f0f0",
                            color: "rgba(72, 90, 122, 0.9)",
                            minWidth: "32px",
                            padding: "0 4px",
                            fontSize: "0.75rem",
                            boxShadow: "none",
                            '&:hover': {
                                backgroundColor: "#e0e0e0",
                            },
                            '&:disabled': {
                                backgroundColor: "#f0f0f0",
                                color: "rgba(194, 199, 207, 0.9)",
                            },
                            height: "20px",
                        }}
                        onClick={() => {
                            const newTask = {
                                ...draftTaskInstance,
                                title: draftTaskInstance.title,
                            };
                            setDraftTaskInstance(newTask);
                            finalizeTaskInstance(newTask);
                        }}
                    >
                        Add
                    </Button>
                </Box>
            </Box>
        </ClickAwayListener>
    );
};
