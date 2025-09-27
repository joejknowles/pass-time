import { Box } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import RepeatIcon from "@mui/icons-material/Repeat";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { TaskSuggestionsConfig } from "./types";
import { IconCard } from "./IconCard";

interface SuggestionTimingTypeCardsSelectProps {
  suggestionsConfig: TaskSuggestionsConfig;
  handleConfigChange: (config: Partial<TaskSuggestionsConfig>) => void;
}

export const SuggestionTimingTypeCardsSelect = ({
  suggestionsConfig,
  handleConfigChange,
}: SuggestionTimingTypeCardsSelectProps) => {
  return (
    <Box display="flex" justifyContent="center" gap={2} mt={2}>
      <IconCard
        icon={HelpOutlineIcon}
        name="Soon"
        isSelected={suggestionsConfig.suggestionTimingType === "SOON"}
        onClick={() => handleConfigChange({ suggestionTimingType: "SOON" })}
      />
      <IconCard
        icon={RepeatIcon}
        name="Recurring"
        isSelected={suggestionsConfig.suggestionTimingType === "RECURRING"}
        onClick={() =>
          handleConfigChange({
            suggestionTimingType: "RECURRING",
            recurringType: suggestionsConfig.recurringType,
            daysSinceLastOccurrence: suggestionsConfig.daysSinceLastOccurrence,
          })
        }
      />
      <IconCard
        icon={EventIcon}
        name="Due Date"
        isSelected={suggestionsConfig.suggestionTimingType === "DUE_DATE"}
        onClick={() =>
          handleConfigChange({
            suggestionTimingType: "DUE_DATE",
            dueDate: suggestionsConfig.dueDate,
            dueDateType: suggestionsConfig.dueDateType,
          })
        }
      />
    </Box>
  );
};
