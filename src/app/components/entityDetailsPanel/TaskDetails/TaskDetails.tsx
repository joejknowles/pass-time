/** @jsxImportSource @emotion/react */
import {
  Box,
  Typography,
  IconButton,
  ClickAwayListener,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, useRef } from "react";
import { DetailedTask, Task } from "../../dayGrid/types";
import { TaskDetailsGeneral } from "./TaskDetailsGeneral";
import { TaskDetailsSuggestions } from "./Suggestions/TaskDetailsSuggestions";
import { useCallOnEscapePress } from "@/app/lib/hooks/useCallOnEscapePress";
import { TaskDetailsActivityStats } from "./TaskDetailsActivityStats/TaskDetailsActivityStats";
import { TASK_DETAILS_TAB_INDEX as TAB_INDEX } from "./TASK_DETAILS_TAB_INDEX";

interface TaskInstanceDetailsProps {
  task: Task | DetailedTask;
  onClose: () => void;
  isMovingATask: boolean;
  goBack?: () => void;
  goToTaskDetails: (taskId: string) => void;
  initialOpenTab?: number;
}

export const TaskDetails = ({
  task,
  isMovingATask,
  goBack,
  onClose,
  goToTaskDetails,
  initialOpenTab,
}: TaskInstanceDetailsProps) => {
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const [tabIndex, setTabIndex] = useState(
    initialOpenTab || TAB_INDEX.ACTIVITY
  );

  useCallOnEscapePress(onClose);

  if (!task) {
    return null;
  }

  const closeIfNotMoving = () => {
    if (!isMovingATask) {
      onClose();
    }
  };

  return (
    <ClickAwayListener onClickAway={closeIfNotMoving}>
      <Box
        ref={detailsRef}
        sx={{
          backgroundColor: "white",
          padding: 3,
          width: "100%",
          minHeight: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
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
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            marginBottom: 3,
            marginRight: "38px",
          }}
        >
          {goBack && (
            <IconButton onClick={goBack}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6">{task.title}</Typography>
        </Box>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Activity" />
          <Tab label="General" />
          <Tab label="Suggestions" />
        </Tabs>
        {tabIndex === TAB_INDEX.ACTIVITY && (
          <TaskDetailsActivityStats task={task} />
        )}
        {tabIndex === TAB_INDEX.GENERAL && (
          <TaskDetailsGeneral task={task} goToTaskDetails={goToTaskDetails} />
        )}
        {tabIndex === TAB_INDEX.SUGGESTIONS && (
          <TaskDetailsSuggestions task={task} />
        )}
      </Box>
    </ClickAwayListener>
  );
};
