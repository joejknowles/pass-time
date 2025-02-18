import { Box, useTheme } from "@mui/material";
import { TaskInstanceDetails } from "./TaskInstanceDetails";
import { useEffect, useLayoutEffect, useState } from "react";
import { TaskDetails } from "./TaskDetails/TaskDetails";
import { DetailedTask, OpenDetailsPanelEntity, Task, TaskInstance } from "../dayGrid/types";
import { useDevice } from "@/app/lib/hooks/useDevice";
import { useQuery } from "@apollo/client";
import { GET_TASK } from "@/app/lib/graphql/queries";

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


const secondsInMs = (seconds: number) => seconds * 1000;

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
    const { isPhabletWidthOrLess } = useDevice();

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

    const taskInstance = isTaskInstanceType ? taskInstances?.find((ti) => ti.id === openDetailsPanelEntity?.id) : null;
    const standardTask = isOpen ? tasks?.find((t) => {
        if (isTaskType) {
            return t.id === openDetailsPanelEntity?.id
        } else {
            return taskInstance ? t.id === taskInstance.task.id : false;
        }
    }) as Task : null;
    const { data: detailedTaskData, refetch: refetchDetailedTask } = useQuery<{ task: DetailedTask }>(GET_TASK, {
        variables: { taskId: standardTask?.id },
        fetchPolicy: "cache-and-network",
        pollInterval: secondsInMs(60),
        skip: !isOpen
    });
    const detailedTask = detailedTaskData?.task;

    let task;
    if (isOpen) {
        task = detailedTask || standardTask as Task | DetailedTask;
    }

    useEffect(() => {
        refetchDetailedTask();
    }, [JSON.stringify(standardTask)]);

    const [previousEntities, setPreviousEntities] = useState<OpenDetailsPanelEntity[]>([]);
    useEffect(() => {
        if (!isOpen) {
            setPreviousEntities([]);
        }
    }, [isOpen]);

    const calculateStyles = () => {
        if (isPhabletWidthOrLess) {
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

        if (isPhabletWidthOrLess) {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        }
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [isPhabletWidthOrLess, openDetailsPanelEntity?.type]);

    useLayoutEffect(() => {
        if (isOpen && isPhabletWidthOrLess && isTaskType) {
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
    }, [isOpen, isPhabletWidthOrLess, isTaskType]);

    const handleClose = () => {
        setTimeout(() => {
            setOpenDetailsPanelEntity(null);
        }, 10);
    }

    const handleGoToTaskDetails = (taskId: string, tab?: number) => {
        setPreviousEntities([...previousEntities, openDetailsPanelEntity as OpenDetailsPanelEntity]);
        setOpenDetailsPanelEntity({ type: "Task", id: taskId, tab });
    };

    if (!isOpen) return null;

    return (
        <Box
            sx={{
                ...modalStyles,
                position: "fixed",
                backgroundColor: "white",
                border: `1px solid ${theme.palette.grey[300]}`,
                borderRadius: isPhabletWidthOrLess ? "8px" : "4px",
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
                        taskInstance={taskInstance as TaskInstance}
                        task={task as Task | DetailedTask}
                        onClose={handleClose}
                        goToTaskDetails={(taskId: string, tab?: number) => {
                            setPreviousEntities([...previousEntities, openDetailsPanelEntity]);
                            setOpenDetailsPanelEntity({ type: "Task", id: taskId, tab });
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
                        task={task as Task | DetailedTask}
                        onClose={handleClose}
                        isMovingATask={!!movingTaskInfo}
                        goBack={previousEntities.length > 0 ? () => {
                            const lastEntity = previousEntities[previousEntities.length - 1];
                            setOpenDetailsPanelEntity(lastEntity);
                            setPreviousEntities(previousEntities.slice(0, -1));
                        } : undefined}
                        goToTaskDetails={handleGoToTaskDetails}
                        initialOpenTab={openDetailsPanelEntity?.tab}
                    />
                )
            }
        </Box>
    );
};

export default EntityDetailsPanel;
