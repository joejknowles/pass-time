import { Box } from "@mui/material";
import { TaskGroupCard, TaskGroupType } from "./TaskGroupCard";
import { TaskCard } from "./TaskCard";
import { useMemo } from "react";

const placeholderGroups = [
  { type: "DATE_SOON", tasks: 2 },
  { type: "RECURRING", tasks: 1 },
  { type: "RECENTS", tasks: 2 },
];

const blobPulseColors = {
  first: "greyPlus.150",
  second: "grey.200",
};

const iconPulseColors = {
  first: "greyPlus.250",
  second: "grey.300",
};

const RandomTextLikeBlobs = () => {
  const sizes = useMemo(() => {
    return [0, 1, 2].map(() => 25 + Math.random() * 60);
  }, []);
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: sizes[i],
            height: 20,
            backgroundColor: blobPulseColors.first,
            borderRadius: 1,
            animation: "pulse 3s infinite",
            "@keyframes pulse": {
              "0%": { backgroundColor: blobPulseColors.first },
              "50%": { backgroundColor: blobPulseColors.second },
              "100%": { backgroundColor: blobPulseColors.first },
            },
          }}
        />
      ))}
    </Box>
  );
};

export const GroupedTasksPlaceholderLoader = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {placeholderGroups.map((group, index) => {
        const tasks = Array.from({ length: group.tasks }, (_, i) => i);
        return (
          <TaskGroupCard
            key={index}
            title={<RandomTextLikeBlobs />}
            type={group.type as TaskGroupType}
            headerSx={{
              color: iconPulseColors.first,
              animation: "fontPulse 3s infinite",
              "@keyframes fontPulse": {
                "0%": { color: iconPulseColors.first },
                "50%": { color: iconPulseColors.second },
                "100%": { color: iconPulseColors.first },
              },
            }}
          >
            {tasks.map((taskIndex) => (
              <TaskCard key={taskIndex}>
                <RandomTextLikeBlobs />
              </TaskCard>
            ))}
          </TaskGroupCard>
        );
      })}
    </Box>
  );
};
