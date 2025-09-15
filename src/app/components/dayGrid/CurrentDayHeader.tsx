import { Box, Button, Typography } from "@mui/material";
import { isToday, isTomorrow, isYesterday } from "./utils";
import { useDevice } from "@/app/lib/hooks/useDevice";

const CurrentDayHeader = ({
  currentDay,
  updateCurrentDay,
}: {
  currentDay: Date;
  updateCurrentDay: (day: Date) => void;
}) => {
  const isViewingToday = isToday(currentDay);
  const dayOfWeek = currentDay.toLocaleDateString("en-US", { weekday: "long" });
  const { isPhabletWidthOrLess } = useDevice();

  const getDayHeading = () => {
    if (isViewingToday) {
      return `Today (${dayOfWeek})`;
    } else if (isYesterday(currentDay)) {
      return `Yesterday (${dayOfWeek})`;
    } else if (isTomorrow(currentDay)) {
      return `Tomorrow (${dayOfWeek})`;
    }
    return `${currentDay.getDate()}/${
      currentDay.getMonth() + 1
    } (${dayOfWeek})`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: isPhabletWidthOrLess ? 1 : 3,
      }}
    >
      <Button
        onClick={() =>
          updateCurrentDay(new Date(currentDay.getTime() - 24 * 60 * 60 * 1000))
        }
      >
        {"<"}
      </Button>
      <Typography variant="body2">{getDayHeading()}</Typography>
      <Button
        onClick={() =>
          updateCurrentDay(new Date(currentDay.getTime() + 24 * 60 * 60 * 1000))
        }
      >
        {">"}
      </Button>
    </Box>
  );
};

export default CurrentDayHeader;
