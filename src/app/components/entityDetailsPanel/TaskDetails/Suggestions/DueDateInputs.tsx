import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  useTheme,
} from "@mui/material";
import { TaskSuggestionsConfig } from "./types";

interface DueDateInputsProps {
  suggestionsConfig: TaskSuggestionsConfig;
  handleConfigChange: (newValues: Partial<TaskSuggestionsConfig>) => void;
}

export const DueDateInputs: React.FC<DueDateInputsProps> = ({
  suggestionsConfig,
  handleConfigChange,
}) => {
  const theme = useTheme();

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" alignItems="center">
        <TextField
          label="Date"
          type="date"
          value={suggestionsConfig.dueDate}
          onChange={(e) =>
            handleConfigChange({
              dueDate: e.target.value,
              suggestionTimingType: "DUE_DATE",
            })
          }
          size="small"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
      </Box>

      <Box component="hr" sx={{ borderTop: theme.palette.grey[300] }} />
      <Card
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border:
            suggestionsConfig.dueDateType === "BEFORE_OR_ON"
              ? `1px solid ${theme.palette.custom.cardBorderSelected}`
              : `1px solid ${theme.palette.grey[300]}`,
          boxShadow: 3,
          backgroundColor:
            suggestionsConfig.dueDateType === "BEFORE_OR_ON"
              ? theme.palette.custom.cardBackgroundSelected
              : theme.palette.custom.white,
        }}
        onClick={
          suggestionsConfig.dueDateType !== "BEFORE_OR_ON"
            ? () => handleConfigChange({ dueDateType: "BEFORE_OR_ON" })
            : undefined
        }
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            padding: "16px !important",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color:
                suggestionsConfig.dueDateType === "BEFORE_OR_ON"
                  ? theme.palette.custom.cardTextSelected
                  : theme.palette.grey[600],
            }}
          >
            Any time up to {suggestionsConfig.dueDate}
          </Typography>
        </CardContent>
      </Card>
      <Card
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border:
            suggestionsConfig.dueDateType === "ON_DATE_ONLY"
              ? `1px solid ${theme.palette.custom.cardBorderSelected}`
              : `1px solid ${theme.palette.grey[300]}`,
          boxShadow: 3,
          backgroundColor:
            suggestionsConfig.dueDateType === "ON_DATE_ONLY"
              ? theme.palette.custom.cardBackgroundSelected
              : theme.palette.custom.white,
        }}
        onClick={
          suggestionsConfig.dueDateType !== "ON_DATE_ONLY"
            ? () => handleConfigChange({ dueDateType: "ON_DATE_ONLY" })
            : undefined
        }
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            padding: "16px !important",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color:
                suggestionsConfig.dueDateType === "ON_DATE_ONLY"
                  ? theme.palette.custom.cardTextSelected
                  : theme.palette.grey[600],
            }}
          >
            Only on {suggestionsConfig.dueDate}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
