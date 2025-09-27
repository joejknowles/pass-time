import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from "@mui/material";
import React, { useRef } from "react";
import { Task } from "./types";

const CreateOrSelectTask = ({
  title,
  onTitleChange,
  submitTask,
  tasks,
  autocompleteProps,
  textFieldProps,
  selectedTask,
  onTaskSelection,
}: {
  title: string;
  onTitleChange: (title: string) => void;
  submitTask: (newTask: { id?: string; title?: string }) => void;
  tasks?: Task[];
  autocompleteProps?: Partial<AutocompleteProps<any, any, any, any>> & {
    key?: string;
  };
  textFieldProps?: Partial<TextFieldProps>;
  selectedTask: Task | null;
  onTaskSelection: (task: Task | null) => void;
}) => {
  const isSubmittingWithOnChangeCallback = useRef(false);
  const autocompleteRef: React.RefObject<HTMLInputElement> = useRef(null);

  const { key, ...spreadableAutocompleteProps } = autocompleteProps || {};

  return (
    <Autocomplete
      key={key}
      value={selectedTask && { label: selectedTask.title, id: selectedTask.id }}
      disablePortal
      openOnFocus
      options={tasks?.map((task) => ({ label: task.title, id: task.id })) || []}
      size="small"
      disableClearable
      onInputChange={(_e, newValue, reason) => {
        if (reason === "input") {
          onTitleChange(newValue);
          const perfectTaskOption = tasks?.find(
            (task) => task.title.toLowerCase() === newValue.toLowerCase()
          );
          if (perfectTaskOption) {
            onTaskSelection(perfectTaskOption);
          }
          if (selectedTask && selectedTask.title !== newValue) {
            onTaskSelection(null);
          }
        }
      }}
      isOptionEqualToValue={(option: { id: string; title: string }, value) =>
        option.id === value.id
      }
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
          const selectedTask =
            tasks?.find((task) => task.id === selection?.id) || null;
          onTaskSelection(selectedTask);
          isSubmittingWithOnChangeCallback.current = true;
          submitTask({
            id: selection.id,
            title: selectedTask?.title,
          });
          autocompleteRef.current?.blur();
        }
      }}
      noOptionsText="Press Enter to create a new task"
      renderInput={(params) => (
        <TextField
          {...params}
          value={title}
          {...textFieldProps}
          inputRef={autocompleteRef}
          slotProps={{
            ...textFieldProps?.slotProps,
            htmlInput: {
              ...params.inputProps,
              enterKeyHint: "go",
              autoCapitalize: "sentence",
            },
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setTimeout(() => {
                if (isSubmittingWithOnChangeCallback.current) {
                  return;
                }

                const perfectTaskOption = tasks?.find(
                  (task) => task.title.toLowerCase() === title.toLowerCase()
                );

                let id;
                if (perfectTaskOption) {
                  id = perfectTaskOption.id;
                }

                submitTask({
                  id,
                  title,
                });
                autocompleteRef.current?.blur();
              }, 100);
              event.preventDefault();
            } else if (event.key === "Tab") {
              const firstMatchingTask = tasks?.find((task) =>
                task.title.toLowerCase().includes(title.toLowerCase())
              );
              if (firstMatchingTask && firstMatchingTask.title !== title) {
                onTitleChange(firstMatchingTask.title);
                onTaskSelection(firstMatchingTask);
                event.preventDefault();
              }
            }
          }}
        />
      )}
      {...spreadableAutocompleteProps}
    />
  );
};

export default CreateOrSelectTask;
