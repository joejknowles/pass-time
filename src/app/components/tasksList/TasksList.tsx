import { Box, Link } from "@mui/material";
import { OpenDetailsPanelEntity, Task } from "../dayGrid/types";
import { GroupedTasks } from "./GroupedTasks";
import { BasicTask, TaskGroup } from "./types";
import CreateOrSelectTask from "../dayGrid/CreateOrSelectTask";
import { useEffect, useState } from "react";
import { useTasks } from "@/app/lib/hooks/useTasks";
import { useDevice } from "@/app/lib/hooks/useDevice";
import MinimizeIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ExpandIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import SearchIcon from "@mui/icons-material/Search";

interface TasksListProps {
  setOpenDetailsPanelEntity: (
    newOpenEntity: OpenDetailsPanelEntity | null
  ) => void;
  setDraggedTask: (
    task: {
      task: BasicTask | Task;
      position: { x: number; y: number };
      width: number;
    } | null
  ) => void;
  draggedTask: {
    task: BasicTask | Task;
    position: { x: number; y: number };
    width: number;
  } | null;
}

export const TasksList = ({
  setOpenDetailsPanelEntity,
  setDraggedTask,
  draggedTask,
}: TasksListProps) => {
  const { isPhabletWidthOrLess, isSmallerPhoneWidthOrLess } = useDevice();
  const [inputText, setInputText] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [additionalTaskGroups, setAdditionalTaskGroups] = useState<TaskGroup[]>(
    []
  );
  const { tasks, createTask } = useTasks();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCreateOrSelectTask, setShowCreateOrSelectTask] = useState(false);

  useEffect(() => {
    if (!isPhabletWidthOrLess) {
      setIsMinimized(false);
    }
  }, [isPhabletWidthOrLess]);

  return (
    <Box
      sx={{
        height: "100%",
        pt: 0,
        display: "flex",
        flexDirection: "column",
        gap: isPhabletWidthOrLess ? 0.5 : 1,
        maxHeight: isPhabletWidthOrLess ? "40dvh" : undefined,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 1,
        }}
      >
        {isPhabletWidthOrLess && (
          <Link
            component="button"
            variant="body2"
            color="textSecondary"
            sx={{
              textDecoration: "none",
              "&:hover": {
                textDecoration: "none",
                color: "text.primary",
              },
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => {
              if (!isMinimized) {
                setShowCreateOrSelectTask(false);
              }
              setIsMinimized(!isMinimized);
            }}
          >
            {isMinimized ? (
              <>
                <ExpandIcon sx={{ fontSize: 14, mr: 0.25 }} /> Show
                {!isSmallerPhoneWidthOrLess && " suggestions"}
              </>
            ) : (
              <>
                <MinimizeIcon sx={{ fontSize: 14, mr: 0.25 }} /> Hide
                {!isSmallerPhoneWidthOrLess && " suggestions"}
              </>
            )}
          </Link>
        )}
        <Link
          component="button"
          variant="body2"
          color="textSecondary"
          sx={{
            textDecoration: "none",
            "&:hover": {
              textDecoration: "none",
              color: "text.primary",
            },
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => {
            if (showCreateOrSelectTask) {
              setInputText("");
              setSelectedTask(null);
            } else {
              setIsMinimized(false);
            }
            setShowCreateOrSelectTask(!showCreateOrSelectTask);
          }}
        >
          {!isPhabletWidthOrLess && (
            <SearchIcon sx={{ fontSize: 18, mr: 0.25 }} />
          )}
          {showCreateOrSelectTask ? "Cancel" : "Find or add task"}
          {isPhabletWidthOrLess && (
            <SearchIcon sx={{ fontSize: 18, ml: 0.25 }} />
          )}
        </Link>
      </Box>
      {showCreateOrSelectTask && (
        <CreateOrSelectTask
          title={inputText}
          onTitleChange={setInputText}
          submitTask={async (task) => {
            setInputText("");
            setSelectedTask(null);
            if (task.id) {
              const submittedTask = tasks?.find((t) => t.id === task.id);
              setOpenDetailsPanelEntity({
                type: "Task",
                id: task.id,
              });
              setAdditionalTaskGroups((existingGroups) => {
                if (existingGroups[0]) {
                  const recentGroup: TaskGroup = existingGroups[0];
                  const tasksWithoutDupes = recentGroup.tasks.filter(
                    (t) => t.id !== task.id
                  );
                  const existingTasks2Max = tasksWithoutDupes.slice(0, 2);
                  return [
                    {
                      ...recentGroup,
                      tasks: [submittedTask, ...existingTasks2Max],
                    } as TaskGroup,
                  ];
                } else {
                  return [
                    {
                      tasks: [submittedTask],
                      name: "Recents",
                      type: "RECENTS",
                    } as TaskGroup,
                  ];
                }
              });
            } else if (task.title) {
              const newTask = await createTask(task.title);
              setAdditionalTaskGroups((existingGroups) => {
                if (existingGroups[0]) {
                  const recentGroup: TaskGroup = existingGroups[0];
                  const existingTasks2Max = recentGroup.tasks.slice(0, 2);
                  return [
                    {
                      ...recentGroup,
                      tasks: [newTask, ...existingTasks2Max],
                    } as TaskGroup,
                  ];
                } else {
                  return [
                    {
                      tasks: [newTask],
                      name: "Recents",
                      type: "RECENTS",
                    } as TaskGroup,
                  ];
                }
              });
            }
            setShowCreateOrSelectTask(false);
          }}
          tasks={tasks}
          selectedTask={selectedTask}
          onTaskSelection={setSelectedTask}
          textFieldProps={{
            placeholder: "Search for a task",
            autoFocus: true,
          }}
        />
      )}
      <Box
        sx={{
          overflowY: "auto",
          scrollbarGutter: "none",
        }}
      >
        <GroupedTasks
          isVisible={!isMinimized}
          {...{
            setOpenDetailsPanelEntity,
            setDraggedTask,
            draggedTask,
            additionalTaskGroups,
          }}
        />
      </Box>
    </Box>
  );
};
