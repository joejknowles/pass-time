/** @jsxImportSource @emotion/react */
import { Box, Typography, IconButton, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent, ClickAwayListener, Menu, TextField, Button, Link } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_TASK_INSTANCE, UPDATE_TASK, UPDATE_TASK_INSTANCE } from "../../lib/graphql/mutations";
import { DetailedTask, Task, TaskInstance } from "../dayGrid/types";
import GoToTaskIcon from '@mui/icons-material/Settings';
import { useDevice } from "@/app/lib/hooks/useDevice";
import { TaskStats } from "./TaskDetails/TaskStats";
import { TASK_DETAILS_TAB_INDEX } from "./TaskDetails/TASK_DETAILS_TAB_INDEX";

interface TaskInstanceDetailsProps {
    taskInstance?: TaskInstance;
    task: Task | DetailedTask;
    onClose: () => void;
    refetchAllTaskData: () => void;
    isMovingATask: boolean;
    setCurrentDay: (day: Date) => void;
    goToTaskDetails: (taskId: string, tab?: number) => void;
}

const cleanApolloEntity = (entity: any) => {
    const { __typename, ...cleanedEntity } = entity;
    return cleanedEntity;
};

export const TaskInstanceDetails = ({
    taskInstance: liveTaskInstance,
    onClose,
    refetchAllTaskData,
    isMovingATask,
    setCurrentDay,
    goToTaskDetails,
    task
}: TaskInstanceDetailsProps) => {
    const detailsRef = useRef<HTMLDivElement | null>(null);
    const lastPresentTaskInstance = useRef(liveTaskInstance);
    // This 'hack' helps to keep displaying the task while changing its date 
    if (liveTaskInstance) {
        lastPresentTaskInstance.current = liveTaskInstance;
    }
    const taskInstance = lastPresentTaskInstance.current;

    const { isPhabletWidthOrLess } = useDevice();
    const [isEditingTime, setIsEditingTime] = useState(false);
    const headerMenuAnchorEl = useRef(null);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

    const [deleteTaskInstance, { loading: isSubmittingDelete }] = useMutation(DELETE_TASK_INSTANCE);
    const [updateTaskInstance, { loading: isSubmittingInstanceUpdate }] = useMutation(UPDATE_TASK_INSTANCE);
    const [updateTask, { loading: isSubmittingTaskUpdate }] = useMutation(UPDATE_TASK);

    const isSubmitting = isSubmittingDelete || isSubmittingInstanceUpdate || isSubmittingTaskUpdate;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, isMovingATask]);

    if (!taskInstance) {
        return null;
    }

    const handleStartChange = async (event: SelectChangeEvent<string>) => {
        let [hour, minute] = event.target.value.split(":").map((n) => parseInt(n));
        await updateTaskInstance({
            variables: {
                input: {
                    id: taskInstance?.id,
                    start: {
                        ...cleanApolloEntity(taskInstance?.start),
                        hour,
                        minute,
                    },
                },
            },
        });
        await refetchAllTaskData();
    }

    const handleDateChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = event.target.value;
        if (newDate && taskInstance) {
            await updateTaskInstance({
                variables: {
                    input: {
                        id: taskInstance.id,
                        start: {
                            ...cleanApolloEntity(taskInstance.start),
                            date: newDate,
                        },
                    },
                },
            });
            await refetchAllTaskData();
            setCurrentDay(new Date(newDate));
        }
    };

    const closeIfNotMoving = () => {
        if (!isMovingATask) {
            onClose();
        }
    }

    const getFormattedTime = (dateTime: Date) => {
        return `${dateTime.getHours().toString().padStart(2, "0")}:${dateTime.getMinutes().toString().padStart(2, "0")}`;
    }
    const getDateTimeFromCustomTime = (customTime: { date: string, hour: number, minute: number }) => {
        const dateTime = new Date(customTime.date);
        dateTime.setHours(customTime.hour);
        dateTime.setMinutes(customTime.minute);
        return dateTime;
    }
    const getStartDateTime = () => {
        return getDateTimeFromCustomTime(taskInstance.start);
    }
    const getFormattedStartTime = () => {
        return getFormattedTime(getStartDateTime());
    }
    const getFormattedEndTime = () => {
        const end = new Date(getStartDateTime().getTime() + taskInstance.duration * 60 * 1000);
        return getFormattedTime(end);
    }
    const getFormattedDate = (dateTime: Date) => {
        const today = new Date();
        const isToday = dateTime.toDateString() === today.toDateString();
        const options = { weekday: 'long' } as const;
        return isToday ? `Today (${dateTime.toLocaleDateString(undefined, options)})` : dateTime.toLocaleDateString();
    }

    const suggestDefaultChange = taskInstance.duration !== (taskInstance.task.defaultDuration || 30);

    return (
        <ClickAwayListener onClickAway={closeIfNotMoving}>
            <Box
                ref={detailsRef}
                sx={{
                    backgroundColor: "white",
                    padding: 3,
                    width: "100%",
                    height: "100%",
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
                    <IconButton
                        onClick={() => setIsHeaderMenuOpen(prev => !prev)}
                        ref={headerMenuAnchorEl}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <IconButton
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Menu
                    anchorEl={headerMenuAnchorEl.current}
                    open={isHeaderMenuOpen}
                    onClose={() => setIsHeaderMenuOpen(false)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    slotProps={{
                        paper: {
                            sx: {
                                maxHeight: 48 * 4.5,
                                width: '20ch',
                            },
                        },
                    }}
                >
                    <MenuItem
                        onClick={async () => {
                            onClose();
                            await deleteTaskInstance({ variables: { id: taskInstance.id } });
                            await refetchAllTaskData();
                        }}
                    >
                        Delete
                    </MenuItem>
                </Menu>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,

                        padding: 1,
                        marginTop: -1,
                        marginRight: "76px",
                        marginBottom: 3,
                        marginLeft: -1,
                        borderRadius: 1,
                        "&:hover .icon": {
                            visibility: "visible",
                        },
                        "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            cursor: "pointer",
                        },
                    }}
                    onClick={() => goToTaskDetails(taskInstance.task.id, TASK_DETAILS_TAB_INDEX.GENERAL)}
                >
                    <Typography variant="h6">
                        {taskInstance.task.title}
                    </Typography>
                    <Box
                        className="icon"
                        sx={{
                            color: "grey.500",
                            display: "flex",
                            alignItems: "center",
                            padding: 0.75,
                            visibility: isPhabletWidthOrLess ? "visible" : "hidden",
                            margin: -0.25,
                        }}
                    >
                        <GoToTaskIcon />
                    </Box>
                </Box>
                {
                    !isEditingTime ? (
                        <Box
                            sx={{
                                display: "inline-flex",
                                flexDirection: "column",
                                gap: 1,
                                marginBottom: 2,
                                "&:hover .MuiIconButton-root": {
                                    visibility: "visible",
                                },
                                "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                                    cursor: "pointer",
                                    padding: 1,
                                    margin: -1,
                                    borderRadius: 1,
                                },
                            }}
                            onClick={() => setIsEditingTime(true)}
                        >
                            <Typography variant="body1">
                                {getFormattedDate(getStartDateTime())}
                            </Typography>
                            <Box
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <Typography variant="body1">
                                    {`${getFormattedStartTime()} - ${getFormattedEndTime()}`}{" "}
                                    <Typography variant="body2" component="span" sx={{ color: "grey.600" }}>
                                        ({taskInstance.duration} minutes)
                                    </Typography>
                                </Typography>
                                <IconButton
                                    onClick={() => setIsEditingTime(true)}
                                    sx={{
                                        padding: 0.75,
                                        visibility: isPhabletWidthOrLess ? undefined : "hidden",
                                        margin: -0.25,
                                    }}
                                    size="small"
                                >
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    ) : (
                        <ClickAwayListener onClickAway={() => setIsEditingTime(false)}>
                            <Box sx={{ marginBottom: 2, display: "inline-block" }}>
                                <Box sx={{ marginBottom: 2 }}>
                                    <TextField
                                        label="Date"
                                        type="date"
                                        value={taskInstance.start.date}
                                        onChange={handleDateChange}
                                        disabled={isSubmitting}
                                        slotProps={{
                                            inputLabel: {
                                                shrink: true,
                                            },
                                        }}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ marginBottom: 2, display: "flex", gap: 2 }}>
                                    <FormControl sx={{ minWidth: 80, flexShrink: 0 }} >
                                        <InputLabel>From</InputLabel>
                                        <Select
                                            label="From"
                                            value={`${taskInstance.start.hour}:${taskInstance.start.minute.toString().padStart(2, '0')}`}
                                            onChange={handleStartChange}
                                            disabled={isSubmitting}
                                            size="small"
                                            MenuProps={{
                                                disablePortal: true,
                                                sx: {
                                                    maxHeight: 350,
                                                },
                                            }}
                                        >
                                            {Array.from({ length: 24 * 4 }, (_, i) => {
                                                const hour = Math.floor(i / 4);
                                                const minute = (i % 4) * 15;
                                                return (
                                                    <MenuItem key={`${hour}:${minute}`} value={`${hour}:${minute.toString().padStart(2, '0')}`}>
                                                        {`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                        <FormControl sx={{ minWidth: 80, mr: 1 }} >
                                            <InputLabel>To</InputLabel>
                                            <Select
                                                label="To"
                                                value={getFormattedEndTime()}
                                                disabled={isSubmitting}
                                                onChange={async (event) => {
                                                    const [hour, minute] = event.target.value.split(":").map((n) => parseInt(n));
                                                    const end = new Date(getStartDateTime().getTime());
                                                    end.setHours(hour);
                                                    end.setMinutes(minute);
                                                    const duration = (end.getTime() - getStartDateTime().getTime()) / (60 * 1000);
                                                    await updateTaskInstance({
                                                        variables: {
                                                            input: {
                                                                id: taskInstance.id,
                                                                duration,
                                                            },
                                                        },
                                                    });
                                                    await refetchAllTaskData();
                                                }}
                                                size="small"
                                                MenuProps={{
                                                    disablePortal: true,
                                                    sx: {
                                                        maxHeight: 350,
                                                    },
                                                }}
                                            >
                                                {Array.from({ length: 24 * 4 }, (_, i) => {
                                                    const endHour = Math.floor(i / 4);
                                                    const endMinute = (i % 4) * 15;
                                                    const endTime = new Date(getStartDateTime().getTime());
                                                    endTime.setHours(endHour);
                                                    endTime.setMinutes(endMinute);
                                                    const duration = (endTime.getTime() - getStartDateTime().getTime()) / (60 * 1000);
                                                    if (duration <= 0) {
                                                        return null;
                                                    }
                                                    const durationHours = Math.floor(duration / 60);
                                                    const durationMinutes = duration % 60;
                                                    const formattedDuration = `${durationHours > 0 ? `${durationHours}h ` : ""}${durationMinutes > 0 ? `${durationMinutes}m` : ""}`.trim();
                                                    return (
                                                        <MenuItem key={`${endHour}:${endMinute}`} value={`${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`}>
                                                            {`${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')} (${formattedDuration})`}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                        {
                                            suggestDefaultChange && (
                                                <Button
                                                    color="warning"
                                                    sx={{
                                                        textAlign: "left",
                                                        ml: -1,
                                                    }}
                                                    disabled={isSubmitting}
                                                    onClick={async () => {
                                                        await updateTask({
                                                            variables: {
                                                                input: {
                                                                    id: taskInstance.task.id,
                                                                    defaultDuration: taskInstance.duration,
                                                                },
                                                            },
                                                        });
                                                        await refetchAllTaskData();
                                                    }}
                                                >
                                                    Set as default duration
                                                </Button>
                                            )
                                        }
                                    </Box>
                                </Box>
                            </Box>
                        </ClickAwayListener>
                    )}
                <Box sx={{ mt: 'auto' }}>
                    <TaskStats
                        task={task}
                        moreLinkOverride={
                            <Link component="button" variant="body2" onClick={() => goToTaskDetails(task.id)}>
                                More stats
                            </Link>
                        } />
                </Box>
            </Box>
        </ClickAwayListener>
    );
};
