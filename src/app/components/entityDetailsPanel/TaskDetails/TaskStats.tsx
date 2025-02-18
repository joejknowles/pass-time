import { Box, Typography, Link } from "@mui/material";
import { useState } from "react";
import { displayMinutes } from "../../utils/date";
import { DetailedTask, Task } from "../../dayGrid/types";

interface TaskStatsProps {
    task: Task | DetailedTask;
}

export const TaskStats = ({ task }: TaskStatsProps) => {
    const [showFullHistory, setShowFullHistory] = useState(false);

    const latestTaskInstance = task.taskInstances[0];
    const durationToday = "progress" in task ? task.progress.today : null;
    const durationThisWeek = "progress" in task ? task.progress.thisWeek : null;
    const durationAllTime = "progress" in task ? task.progress.allTime : null;

    return (
        <>
            <Typography variant="caption">Usage</Typography>
            {
                durationAllTime === null && (
                    "..."
                )
            }
            {
                durationAllTime !== null &&
                durationToday !== null &&
                durationThisWeek !== null &&
                (
                    <>
                        {durationAllTime > 0 && (
                            <>
                                <Typography variant="body2">
                                    {displayMinutes(durationToday)}{" "}
                                    <Typography
                                        variant="body2"
                                        component="span"
                                        color="textSecondary"
                                    >
                                        today
                                    </Typography>
                                </Typography>
                                <Typography variant="body2">
                                    {displayMinutes(durationThisWeek)}{" "}
                                    <Typography
                                        variant="body2"
                                        component="span"
                                        color="textSecondary"
                                    >
                                        this week
                                    </Typography>
                                </Typography>
                            </>
                        )}
                        <Typography variant="body2">
                            {displayMinutes(durationAllTime)}{" "}
                            <Typography
                                variant="body2"
                                component="span"
                                color="textSecondary"
                            >
                                all time
                            </Typography>
                        </Typography>
                    </>
                )}
            {
                latestTaskInstance && (
                    <>
                        <Typography variant="body2">Latest: {latestTaskInstance?.start.date}</Typography>
                        <Link component="button" variant="body2" onClick={() => setShowFullHistory(!showFullHistory)}>
                            {showFullHistory ? "Hide" : "More"}
                        </Link>
                        {showFullHistory && (
                            <Box sx={{ my: 2 }}>
                                {task.taskInstances.map((instance, index) => (
                                    <Typography key={index} variant="body2">
                                        {instance.start.date} - {displayMinutes(instance.duration)}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </>
                )}
        </>
    );
};

