/** @jsxImportSource @emotion/react */
import { Autocomplete, Box, TextField } from "@mui/material";
import { useEffect } from "react";
import { css } from '@emotion/react';
import { Task } from "@prisma/client";

const titleInputStyle = css`
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 16px;
  width: 100%;
  
  ::placeholder {
    color: rgba(255, 255, 255, 0.7);
    opacity: 1;
  }
`;

interface DraftTaskInstance {
    title: string;
    start: {
        date: string;
        hour: number;
        minute: number;
    };
    duration: number;
    taskId?: number;
}


const daytimeHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const HOUR_COLUMN_WIDTH = 50;

export const DraftTaskInstance = ({
    draftTaskInstance,
    setDraftTaskInstance,
    finalizeTaskInstance,
    tasks
}: {
    draftTaskInstance: DraftTaskInstance,
    setDraftTaskInstance: (task: DraftTaskInstance) => void,
    finalizeTaskInstance: (task: DraftTaskInstance) => void,
    tasks?: Task[],
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                finalizeTaskInstance(draftTaskInstance);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [draftTaskInstance]);

    return (

        <Box
            sx={{
                position: "absolute",
                top: `${(((draftTaskInstance.start.hour - daytimeHours[0]) * 60 + draftTaskInstance.start.minute) / (daytimeHours.length * 60)) * 100}%`,
                height: `${((draftTaskInstance.duration) / (daytimeHours.length * 60)) * 100}%`,
                left: HOUR_COLUMN_WIDTH + 16,
                width: "80%",
                backgroundColor: "rgba(63, 81, 181, 0.7)",
                borderRadius: "4px",
                padding: "0 4px",
                boxSizing: "border-box",
            }}
        >
            <Autocomplete
                disablePortal
                autoFocus
                options={tasks?.filter((task, index) => {
                    return tasks.findIndex((t) => t.title === task.title) === index;
                }).map((task) => ({ label: task.title, id: task.id })) || []}
                size="small"
                onInputChange={(_e, value) => {
                    setDraftTaskInstance({
                        ...draftTaskInstance,
                        title: value,
                    });
                }}
                onChange={(_e, selection) => {
                    setDraftTaskInstance({
                        ...draftTaskInstance,
                        title: selection?.label || "",
                        taskId: selection?.id,
                    });
                }}
                noOptionsText="Press Enter to create a new task"
                renderInput={(params) => <TextField
                    {...params}
                    sx={{
                        "& .MuiInput-underline:before": {
                            borderBottom: "none",
                        },
                        "& .MuiInput-underline:after": {
                            borderBottom: "none",
                        },
                        "& .MuiInput-underline:hover:before": {
                            borderBottom: "none",
                        },
                        "& .MuiInput-underline:hover:after": {
                            borderBottom: "none",
                        },
                    }}
                    variant="standard"
                />}
            />
        </Box>
    );
};