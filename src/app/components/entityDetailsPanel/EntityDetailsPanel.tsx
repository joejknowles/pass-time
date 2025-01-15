import { Box, useMediaQuery, useTheme } from "@mui/material";
import { TaskInstanceDetails } from "./TaskInstanceDetails";
import { useEffect, useLayoutEffect, useState } from "react";
import { TaskDetails } from "./TaskDetails/TaskDetails";
import { OpenDetailsPanelEntity, Task, TaskInstance } from "../dayGrid/types";

interface EntityDetailsPanelProps {
    openDetailsPanelEntity: OpenDetailsPanelEntity | null;
    taskInstances: TaskInstance[] | undefined;
    tasks: Task[] | undefined;
    setOpenDetailsPanelEntity: (
        entity: OpenDetailsPanelEntity | null
    ) => void;
    refetchAllTaskData: () => void;
    movingTaskInfo: any;
    setCurrentDay: (day: Date) => void;
}

const EntityDetailsPanel = ({
    openDetailsPanelEntity,
    taskInstances,
    tasks,
    setOpenDetailsPanelEntity,
    refetchAllTaskData,
    movingTaskInfo,
    setCurrentDay,
}: EntityDetailsPanelProps) => {
    const theme = useTheme();
    const isNarrowScreen = useMediaQuery("(max-width:710px)");

    const isOpen = !!openDetailsPanelEntity;
    const isTaskType = openDetailsPanelEntity?.type === "Task";
    const isTaskInstanceType = openDetailsPanelEntity?.type === "TaskInstance";

    const [modalStyles, setModalStyles] = useState<{
        top?: string;
        bottom?: string;
        left: string;
        height?: string;
        width: string;
    }>({
        top: "10vh",
        left: "10px",
        height: "100%",
        width: "100%",
    });

    const [previousEntities, setPreviousEntities] = useState<OpenDetailsPanelEntity[]>([]);
    useEffect(() => {
        if (!isOpen) {
            setPreviousEntities([]);
        }
    }, [isOpen]);

    const calculateStyles = () => {
        if (isNarrowScreen) {
            setModalStyles({
                top: isTaskType ? "10px" : undefined,
                bottom: "10px",
                left: "10px",
                height: isTaskType ? undefined : "50vh",
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
    }, [isNarrowScreen, openDetailsPanelEntity?.type]);

    useLayoutEffect(() => {
        if (isOpen && isNarrowScreen && isTaskType) {
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
    }, [isOpen, isNarrowScreen, isTaskType]);

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
                isTaskInstanceType &&
                (
                    <TaskInstanceDetails
                        key={`${openDetailsPanelEntity?.type}-${openDetailsPanelEntity?.id}`}
                        taskInstance={taskInstances?.find((ti) => ti.id === openDetailsPanelEntity.id) as TaskInstance}
                        onClose={() => setOpenDetailsPanelEntity(null)}
                        goToTaskDetails={(taskId: string) => {
                            setPreviousEntities([...previousEntities, openDetailsPanelEntity]);
                            setOpenDetailsPanelEntity({ type: "Task", id: taskId });
                        }}
                        refetchAllTaskData={refetchAllTaskData}
                        isMovingATask={!!movingTaskInfo}
                        setCurrentDay={setCurrentDay}
                    />
                )
            }
            {
                isTaskType &&
                (
                    <TaskDetails
                        key={`${openDetailsPanelEntity?.type}-${openDetailsPanelEntity?.id}`}
                        task={tasks?.find((t) => t.id == openDetailsPanelEntity.id) as Task}
                        onClose={() => setOpenDetailsPanelEntity(null)}
                        isMovingATask={!!movingTaskInfo}
                        tasks={tasks as Task[]}
                        goBack={previousEntities.length > 0 ? () => {
                            const lastEntity = previousEntities[previousEntities.length - 1];
                            setOpenDetailsPanelEntity(lastEntity);
                            setPreviousEntities(previousEntities.slice(0, -1));
                        } : undefined}
                    />
                )
            }
        </Box>
    );
};

export default EntityDetailsPanel;
