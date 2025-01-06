import { Box, useMediaQuery, useTheme } from "@mui/material";
import { TaskInstanceDetails } from "./TaskInstanceDetails";
import { useLayoutEffect, useState } from "react";

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

interface EntityDetailsPanelProps {
    openDetailsPanelEntity: { id: string, type: "Task" | "TaskInstance" } | null;
    taskInstances: TaskInstance[] | undefined;
    setOpenDetailsPanelEntity: (
        entity: { id: string, type: "Task" | "TaskInstance" } | null
    ) => void;
    refetchAllTaskData: () => void;
    movingTaskInfo: any;
    setCurrentDay: (day: Date) => void;
}

const EntityDetailsPanel = ({
    openDetailsPanelEntity,
    taskInstances,
    setOpenDetailsPanelEntity,
    refetchAllTaskData,
    movingTaskInfo,
    setCurrentDay
}: EntityDetailsPanelProps) => {
    const theme = useTheme();
    const isNarrowScreen = useMediaQuery("(max-width:710px)");

    const isOpen = !!openDetailsPanelEntity;

    const [modalStyles, setModalStyles] = useState<{
        top?: string;
        bottom?: string;
        left: string;
        height: string;
        width: string;
    }>({
        top: "10vh",
        left: "10px",
        height: "100%",
        width: "100%",
    });

    const calculateStyles = () => {
        if (isNarrowScreen) {
            setModalStyles({
                top: undefined,
                bottom: "10px",
                left: "10px",
                height: "50vh",
                width: "calc(100% - 20px)",
            });
        } else {
            const dayGridRoot = document.querySelector("#day-grid-root");
            if (dayGridRoot) {
                const rect = dayGridRoot.getBoundingClientRect();
                setModalStyles({
                    top: `${rect.top}px`,
                    left: "10px",
                    height: `${rect.height}px`,
                    width: `calc(${rect.left}px - 20px)`,
                });
            }
        }
    };

    useLayoutEffect(() => {
        calculateStyles();

        const handleResize = () => calculateStyles();
        window.addEventListener("resize", handleResize);

        if (isNarrowScreen) {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        }
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [isNarrowScreen]);

    useLayoutEffect(() => {
        if (isOpen && !isNarrowScreen) {
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        } else {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        }
        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Box
            sx={{
                ...modalStyles,
                position: "fixed",
                backgroundColor: "white",
                border: `1px solid ${theme.palette.grey[300]}`,
                borderRadius: isNarrowScreen ? "8px" : "4px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
                overflowY: "auto",
            }}
        >
            {
                openDetailsPanelEntity?.type === "TaskInstance" &&
                <TaskInstanceDetails
                    key={`${openDetailsPanelEntity?.type}-${openDetailsPanelEntity?.id}`}
                    taskInstance={taskInstances?.find((ti) => ti.id === openDetailsPanelEntity.id) as TaskInstance}
                    onClose={() => setOpenDetailsPanelEntity(null)}
                    refetchAllTaskData={refetchAllTaskData}
                    isMovingATask={!!movingTaskInfo}
                    setCurrentDay={setCurrentDay}
                />
            }
        </Box>
    );
};

export default EntityDetailsPanel;
