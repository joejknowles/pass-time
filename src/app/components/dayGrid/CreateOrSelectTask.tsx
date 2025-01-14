import { Autocomplete, TextField } from "@mui/material";
import { useRef, useState } from "react";
import { Task } from "./types";

const CreateOrSelectTask = ({
    title,
    onTitleChange,
    submitTask,
    tasks,
    isSubmitting
}: {
    title: string,
    onTitleChange: (title: string) => void,
    submitTask: (taskIdOrTitle: string) => void,
    tasks?: Task[],
    isSubmitting?: boolean,
}) => {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const isSubmittingWithOnChangeCallback = useRef(false);

    return (
        <Autocomplete
            key={title}
            value={selectedTask && { label: selectedTask.title, id: selectedTask.id }}
            disablePortal
            disabled={isSubmitting}
            autoFocus
            openOnFocus
            options={tasks?.map((task) => ({ label: task.title, id: task.id })) || []}
            size="small"
            onInputChange={(_e, value, reason) => {
                if (reason === "input") {
                    onTitleChange(value);
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
            inputValue={title}
            onChange={(_e, selection) => {
                if (selection) {
                    const selectedTask = tasks?.find((task) => task.id === selection?.id) || null;
                    setSelectedTask(selectedTask);

                    console.log("CreateOrSelectTask onChange", selection);
                    isSubmittingWithOnChangeCallback.current = true;
                    submitTask(selection?.id || title);
                }
            }}
            noOptionsText="Press Enter to create a new task"
            renderInput={(params) => (
                <TextField
                    {...params}
                    value={title}
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

                                const perfectTaskOption = tasks
                                    ?.find((task) =>
                                        task.title.toLowerCase() === title.toLowerCase()
                                    );
                                let taskIdOrTitle = title;

                                if (perfectTaskOption) {
                                    taskIdOrTitle = perfectTaskOption.id;
                                }

                                submitTask(taskIdOrTitle);
                            }, 100);
                            event.preventDefault();
                        } else if (event.key === "Tab") {
                            const firstMatchingTask = tasks?.find((task) =>
                                task.title.toLowerCase().includes(title.toLowerCase())
                            );
                            if (firstMatchingTask && firstMatchingTask.title !== title) {
                                onTitleChange(firstMatchingTask.title);
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
    );
};

export default CreateOrSelectTask;
