/** @jsxImportSource @emotion/react */
import { Box, ClickAwayListener, Button } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ClientDateTime, Task } from "./types";
import BasicTaskInstanceCard from "./taskInstanceCards/BasicTaskInstanceCard";
import CreateOrSelectTask from "./CreateOrSelectTask";

interface DraftTaskInstance {
  title: string;
  start: ClientDateTime;
  duration: number;
  taskId?: string;
}

const daytimeHours = [
  7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
];
const HOUR_COLUMN_WIDTH = 50;

export const DraftTaskInstanceCard = ({
  draftTaskInstance,
  setDraftTaskInstance,
  finalizeTaskInstance,
  tasks,
  isBeingDragged,
  isSubmitting,
}: {
  draftTaskInstance: DraftTaskInstance;
  setDraftTaskInstance: Dispatch<SetStateAction<DraftTaskInstance | null>>;
  finalizeTaskInstance: (task: DraftTaskInstance) => void;
  tasks?: Task[];
  isBeingDragged?: boolean;
  isSubmitting?: boolean;
}) => {
  const thisRootRef = useRef<HTMLDivElement>(null);
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

  const handleTaskSelection = (task: Task | null) => {
    setSelectedTask(task);
    setDraftTaskInstance((draftTaskInstance) =>
      draftTaskInstance
        ? {
            ...draftTaskInstance,
            title: task ? task?.title || "" : draftTaskInstance.title,
            taskId: task?.id,
            duration: task?.defaultDuration || 30,
          }
        : null
    );
  };

  const handleTitleChange = (title: string) => {
    setSelectedTask(null);
    setDraftTaskInstance({
      ...draftTaskInstance,
      title,
    });
  };

  const handleSubmitTask = ({ id, title }: { id?: string; title?: string }) => {
    const selectedTask = (id && tasks?.find((task) => task.id === id)) || null;
    const newDraftTaskInstance = {
      ...draftTaskInstance,
      title: selectedTask?.title || title || "",
      taskId: selectedTask?.id,
      duration: selectedTask?.defaultDuration || 30,
    };
    setDraftTaskInstance(newDraftTaskInstance);
    finalizeTaskInstance(newDraftTaskInstance);
  };

  if (isBeingDragged || isSubmitting) {
    return (
      <BasicTaskInstanceCard
        title={draftTaskInstance.title}
        start={draftTaskInstance.start}
        duration={draftTaskInstance.duration}
        hourBlockHeight={60}
        isThisTaskDetailsOpen={true}
        sx={
          isSubmitting
            ? {
                cursor: "wait",
              }
            : {
                cursor: "grabbing",
              }
        }
      />
    );
  }
  return (
    <ClickAwayListener
      onClickAway={(e) => {
        e.preventDefault();
        setDraftTaskInstance(null);
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: `CALC(1px + ${
            (((draftTaskInstance.start.hour - daytimeHours[0]) * 60 +
              draftTaskInstance.start.minute) /
              (daytimeHours.length * 60)) *
            100
          }%)`,
          height: `CALC(${
            (Math.max(30, draftTaskInstance.duration) /
              (daytimeHours.length * 60)) *
            100
          }% - 1px)`,
          left: HOUR_COLUMN_WIDTH + 16,
          right: 16,
          backgroundColor: "rgba(4, 70, 190, 0.9)",
          borderRadius: "4px",
          padding: "0 4px",
          boxSizing: "border-box",
          boxShadow: "2px 2px 10px 1px rgba(123, 158, 206, 0.9)",
        }}
        ref={thisRootRef}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CreateOrSelectTask
            title={draftTaskInstance.title}
            onTitleChange={handleTitleChange}
            submitTask={handleSubmitTask}
            tasks={tasks}
            selectedTask={selectedTask}
            onTaskSelection={handleTaskSelection}
            autocompleteProps={{
              sx: {
                flexGrow: 1,
                "& .MuiAutocomplete-inputRoot": {
                  color: "white",
                  WebkitTextFillColor: "white !important",
                },
                "& .MuiAutocomplete-listbox": {
                  backgroundColor: "rgba(63, 81, 181, 0.9)",
                },
                "& .MuiAutocomplete-endAdornment .MuiButtonBase-root": {
                  color: "white",
                  WebkitTextFillColor: "white !important",
                },
              },
              key: `${draftTaskInstance.start.date}:${draftTaskInstance.start.hour}:${draftTaskInstance.start.minute}`,
            }}
            textFieldProps={{
              sx: {
                "& .MuiInputBase-input": {
                  color: "white !important",
                  WebkitTextFillColor: "white !important",
                },
                "& .MuiInput-underline:before, & .MuiInput-underline:hover:before, & .MuiInput-underline:after":
                  {
                    borderBottom: "none !important",
                  },
              },
              variant: "standard",
              autoFocus: true,
            }}
          />
          {!isBeingDragged && !isSubmitting && (
            <Button
              variant="contained"
              disabled={isBeingDragged || isSubmitting}
              sx={{
                marginLeft: 1,
                backgroundColor: "#f0f0f0",
                color: "rgba(72, 90, 122, 0.9)",
                minWidth: "32px",
                padding: "0 4px",
                fontSize: "0.75rem",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
                "&:disabled": {
                  backgroundColor: "#f0f0f0",
                  color: "rgba(194, 199, 207, 0.9)",
                },
                height: "20px",
              }}
              onClick={() => {
                const newDraftTaskInstance = selectedTask
                  ? {
                      ...draftTaskInstance,
                      title: selectedTask?.title || "",
                      taskId: selectedTask?.id,
                      duration: selectedTask?.defaultDuration || 30,
                    }
                  : draftTaskInstance;
                setDraftTaskInstance(newDraftTaskInstance);
                finalizeTaskInstance(newDraftTaskInstance);
              }}
            >
              Add
            </Button>
          )}
        </Box>
      </Box>
    </ClickAwayListener>
  );
};
