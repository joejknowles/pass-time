/** @jsxImportSource @emotion/react */
import { Box, Typography, IconButton, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent, ClickAwayListener, Menu, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_TASK_INSTANCE, UPDATE_TASK_INSTANCE } from "../lib/graphql/mutations";

interface TaskInstance {
    id: string;
    task: {
        title: string;
        userId: number;
    };
    start: {
        date: string;
        hour: number;
        minute: number;
    };
    duration: number;
}

interface TaskInstanceDetailsProps {
    taskInstance: TaskInstance;
    onClose: () => void;
    refetchAllTaskData: () => void;
    isMovingATask: boolean;
}

const cleanApolloEntity = (entity: any) => {
    const { __typename, ...cleanedEntity } = entity;
    return cleanedEntity;
};

export const TaskInstanceDetails = ({ taskInstance, onClose, refetchAllTaskData, isMovingATask }: TaskInstanceDetailsProps) => {
    const detailsRef = useRef<HTMLDivElement | null>(null);

    const isNarrowScreen = useMediaQuery("(max-width: 720px)");
    const [isEditingTime, setIsEditingTime] = useState(false);
    const headerMenuAnchorEl = useRef(null);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

    const [deleteTaskInstance] = useMutation(DELETE_TASK_INSTANCE);
    const [updateTaskInstance] = useMutation(UPDATE_TASK_INSTANCE);

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

    const handleStartChange = async (event: SelectChangeEvent<string>) => {
        let [hour, minute] = event.target.value.split(":").map((n) => parseInt(n));
        await updateTaskInstance({
            variables: {
                input: {
                    id: taskInstance.id,
                    start: {
                        ...cleanApolloEntity(taskInstance.start),
                        hour,
                        minute,
                    },
                },
            },
        });
        await refetchAllTaskData();
    }

    const closeIfNotMoving = () => {
        if (!isMovingATask) {
            onClose();
        }
    }

    if (!taskInstance) {
        return null;
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

    return (
        <ClickAwayListener onClickAway={closeIfNotMoving}>
            <Box
                ref={detailsRef}
                sx={{
                    backgroundColor: "white",
                    padding: 2,
                    width: "100%",
                    height: "100%",
                    position: "relative",
                }}
            >
                <IconButton
                    onClick={() => setIsHeaderMenuOpen(prev => !prev)}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 40,
                        zIndex: 10,
                    }}
                    ref={headerMenuAnchorEl}
                >
                    <MoreVertIcon />
                </IconButton>
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
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 10,
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6">{taskInstance.task.title}</Typography>
                {
                    !isEditingTime ? (
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                marginBottom: 2,
                                "&:hover .MuiIconButton-root": {
                                    visibility: "visible",
                                }
                            }}
                            onClick={() => setIsEditingTime(true)}
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
                                    padding: 1,
                                    visibility: isNarrowScreen ? undefined : "hidden",
                                }}
                                size="small"
                            >
                                <EditIcon />
                            </IconButton>
                        </Box>
                    ) : (
                        <ClickAwayListener onClickAway={() => setIsEditingTime(false)}>
                            <Box sx={{ marginBottom: 2 }}>
                                <Box sx={{ marginBottom: 2 }}>

                                    <FormControl variant="standard" sx={{ minWidth: 80 }} >
                                        <InputLabel>From</InputLabel>
                                        <Select
                                            value={`${taskInstance.start.hour}:${taskInstance.start.minute.toString().padStart(2, '0')}`}
                                            onChange={handleStartChange}
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
                                </Box>
                                <Box sx={{ marginBottom: 2, display: "flex", alignItems: "center" }}>
                                    <FormControl variant="standard" sx={{ minWidth: 80 }} >
                                        <InputLabel>Duration</InputLabel>
                                        <Select
                                            value={taskInstance.duration}
                                            onChange={async (event) => {
                                                const duration = parseInt(event.target.value as string);
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
                                            {Array.from({ length: 18 * 4 }, (_, i) => {
                                                const duration = (i + 1) * 15;
                                                const hours = Math.floor(duration / 60);
                                                const minutes = duration % 60;
                                                const display = `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m` : ""}`;
                                                return (
                                                    <MenuItem key={duration} value={duration}>
                                                        {display}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                    <Box
                                        sx={{
                                            width: "1px",
                                            bgcolor: "grey.300",
                                            margin: "0 24px",
                                            height: 32,
                                        }}
                                    />
                                    <FormControl variant="standard" sx={{ minWidth: 80 }} >
                                        <InputLabel>To</InputLabel>
                                        <Select
                                            value={getFormattedEndTime()}
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
                                </Box>
                            </Box>
                        </ClickAwayListener>
                    )}
            </Box>
        </ClickAwayListener>
    );
};
