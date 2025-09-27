import { Box, Typography, Link } from "@mui/material";
import { ReactNode, useState } from "react";
import { displayMinutes } from "../../../utils/date";
import { DetailedTask, Task } from "../../../dayGrid/types";

interface TaskStatsProps {
  task: Task | DetailedTask;
  moreLinkOverride?: ReactNode;
}

export const TaskStats = ({ task, moreLinkOverride }: TaskStatsProps) => {
  const [showFullHistory, setShowFullHistory] = useState(false);

  const latestTaskInstance = task.taskInstances[0];
  const durationToday = "stats" in task ? task.stats.totals.today : null;
  const durationThisWeek = "stats" in task ? task.stats.totals.thisWeek : null;
  const durationAllTime = "stats" in task ? task.stats.totals.allTime : null;

  return (
    <>
      <Typography variant="caption">Usage</Typography>
      {durationAllTime === null && "..."}
      {durationAllTime !== null &&
        durationToday !== null &&
        durationThisWeek !== null && (
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
      {latestTaskInstance && (
        <>
          <Typography variant="body2">
            Latest: {latestTaskInstance?.start.date}
          </Typography>
          {moreLinkOverride || (
            <Link
              component="button"
              variant="body2"
              onClick={() => setShowFullHistory(!showFullHistory)}
            >
              {showFullHistory ? "Hide" : "More"}
            </Link>
          )}
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
