/** @jsxImportSource @emotion/react */
import { Box } from "@mui/material";
import { useEffect } from "react";
import { css } from '@emotion/react';

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
}


const daytimeHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const HOUR_COLUMN_WIDTH = 50;

export const DraftTaskInstance = ({
    draftTask,
    setDraftTask,
    finalizeTask,
}: {
    draftTask: DraftTaskInstance,
    setDraftTask: (task: DraftTaskInstance) => void,
    finalizeTask: (task: DraftTaskInstance) => void
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                finalizeTask(draftTask);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [draftTask]);

    return (

        <Box
            sx={{
                position: "absolute",
                top: `${(((draftTask.start.hour - daytimeHours[0]) * 60 + draftTask.start.minute) / (daytimeHours.length * 60)) * 100}%`,
                height: `${((draftTask.duration) / (daytimeHours.length * 60)) * 100}%`,
                left: HOUR_COLUMN_WIDTH + 16,
                width: "80%",
                backgroundColor: "rgba(63, 81, 181, 0.7)",
                borderRadius: "4px",
                padding: "4px",
                boxSizing: "border-box",
            }}
        >
            <input
                value={draftTask.title}
                onChange={(e) => {
                    setDraftTask({
                        ...draftTask,
                        title: e.target.value,
                    });
                }}
                ref={(ref) => {
                    ref?.focus();
                }}
                placeholder="What needs to be done?"
                css={titleInputStyle}
            />
        </Box>
    );
};