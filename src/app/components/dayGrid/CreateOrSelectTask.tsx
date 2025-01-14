import { Autocomplete, TextField } from "@mui/material";
import { useRef, useState } from "react";
import { Task } from "./types";

const CreateOrSelectTask = ({
    title,
    onTitleChange,
    submitTask,
    tasks,
    autocompleteProps,
    textFieldProps
}: {
    title: string,
    onTitleChange: (title: string) => void,
    submitTask: (taskIdOrTitle: string) => void,
    tasks?: Task[],
    autocompleteProps?: any,
    textFieldProps?: any,
}) => {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const isSubmittingWithOnChangeCallback = useRef(false);

    return (
        <Autocomplete
            key={title}
            value={selectedTask && { label: selectedTask.title, id: selectedTask.id }}
            disablePortal
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
            isOptionEqualToValue={(option: { id: string, title: string }, value) => option.id === value.id}
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
                    {...textFieldProps}
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
            {...autocompleteProps}
        />
    );
};

export default CreateOrSelectTask;
