import { Box, useMediaQuery, useTheme } from "@mui/material";
import { TaskInstanceDetails } from "./TaskInstanceDetails";
import { useEffect } from "react";

interface Task {
    id: number;
    title: string;
    userId: number;
}

interface TaskInstance {
    id: string;
    task: Task;
    start: {
        date: string;
        hour: number;
        minute: number;
    };
    duration: number;
}

const TaskInstanceModal = ({
    openTaskInstanceId,
    taskInstances,
    setOpenTaskInstanceId,
    refetchAllTaskData,
    movingTaskInfo,
}: {
    openTaskInstanceId: string | null;
    taskInstances: TaskInstance[] | undefined;
    setOpenTaskInstanceId: (id: string | null) => void;
    refetchAllTaskData: () => void;
    movingTaskInfo: any;
}) => {
    const theme = useTheme();
    const isNarrowScreen = useMediaQuery("(max-width:710px)");

    const isOpen = !!openTaskInstanceId;

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Box
            sx={{
                position: "fixed",
                top: isNarrowScreen
                    ? "10vh"
                    : `${document.querySelector("#day-grid-root")?.getBoundingClientRect().top}px`,
                left: "10px",
                height: isNarrowScreen
                    ? "80vh"
                    : `${document.querySelector("#day-grid-root")?.getBoundingClientRect().height}px`,
                width: isNarrowScreen
                    ? "calc(100% - 20px)"
                    : `calc(${document.querySelector("#day-grid-root")?.getBoundingClientRect().left}px - 20px)`,
                backgroundColor: "white",
                border: `1px solid ${theme.palette.grey[300]}`,
                borderRadius: isNarrowScreen ? "8px" : "4px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
                overflowY: "auto",
            }}
        >
            <TaskInstanceDetails
                key={openTaskInstanceId}
                taskInstance={taskInstances?.find((ti) => ti.id === openTaskInstanceId) as TaskInstance}
                onClose={() => setOpenTaskInstanceId(null)}
                refetchAllTaskData={refetchAllTaskData}
                isMovingATask={!!movingTaskInfo}
            />
        </Box>
    );
};

export default TaskInstanceModal;
