import {
  Box,
  FormControlLabel,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { SuggestionTimingTypeCardsSelect } from "./SuggestionTimingTypeCardsSelect";
import { RecurringInputs } from "./RecurringInputs";
import { DueDateInputs } from "./DueDateInputs";
import { TaskSuggestionsConfig, RECURRING_TYPES } from "./types";
import { GET_TASK_SUGGESTION_CONFIG } from "@/app/lib/graphql/queries";
import { UPDATE_TASK_SUGGESTION_CONFIG } from "@/app/lib/graphql/mutations";
import { DetailedTask, Task } from "@/app/components/dayGrid/types";
import { useTasks } from "@/app/lib/hooks/useTasks";

interface TaskDetailsSuggestionsProps {
  task: Task | DetailedTask;
}

export const TaskDetailsSuggestions = ({
  task,
}: TaskDetailsSuggestionsProps) => {
  const theme = useTheme();
  const [isSuggestingEnabled, setIsSuggestingEnabled] = useState<boolean>(
    task.isSuggestingEnabled
  );
  const [suggestionsConfig, setSuggestionsConfig] =
    useState<TaskSuggestionsConfig>({
      suggestionTimingType: "RECURRING",
      daysSinceLastOccurrence: 3,
      specificDays: "SUNDAY",
      recurringType: RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE,
      // tomorrow
      dueDate: new Date(
        new Date().setDate(new Date().getDate() + 1)
      ).toLocaleDateString("en-CA"),
      dueDateType: "BEFORE_OR_ON",
    });

  const {
    data: suggestionConfigData,
    loading: isConfigLoading,
    refetch: refetchSuggestionConfig,
  } = useQuery(GET_TASK_SUGGESTION_CONFIG, {
    variables: { taskId: task.id },
  });

  const [updateTaskSuggestionConfig] = useMutation(
    UPDATE_TASK_SUGGESTION_CONFIG
  );
  const { updateTask } = useTasks();

  useEffect(() => {
    if (suggestionConfigData?.taskSuggestionConfig) {
      const nonEmptyValues = Object.fromEntries(
        Object.entries(suggestionConfigData.taskSuggestionConfig).filter(
          ([, value]) => value !== null && value !== undefined
        )
      );
      setSuggestionsConfig((suggestionsConfig) => ({
        ...suggestionsConfig,
        ...nonEmptyValues,
      }));
    }
  }, [suggestionConfigData]);

  const handleConfigChange = async (
    newValues: Partial<TaskSuggestionsConfig>
  ) => {
    setSuggestionsConfig((prevConfig) => ({ ...prevConfig, ...newValues }));

    await updateTaskSuggestionConfig({
      variables: {
        input: {
          taskId: task.id,
          ...newValues,
        },
      },
    });
    refetchSuggestionConfig();
  };

  const handleSuggestionsEnabledChange = useCallback(async () => {
    setIsSuggestingEnabled((value) => {
      const newValue = !value;
      return newValue;
    });

    const newValue = !isSuggestingEnabled;
    if (newValue) {
      setSuggestionsConfig((config) => ({
        ...config,
        recurringType: RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE,
      }));
      await updateTaskSuggestionConfig({
        variables: {
          input: {
            taskId: task.id,
            suggestionTimingType: suggestionsConfig.suggestionTimingType,
            recurringType: suggestionsConfig.recurringType,
            daysSinceLastOccurrence: suggestionsConfig.daysSinceLastOccurrence,
          },
        },
      });
      refetchSuggestionConfig();
    }

    await updateTask(task.id, { isSuggestingEnabled: newValue });
  }, [isSuggestingEnabled, suggestionsConfig]);

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={isSuggestingEnabled}
            onChange={handleSuggestionsEnabledChange}
          />
        }
        label={`Suggestions are ${
          isSuggestingEnabled ? "enabled" : "disabled"
        }`}
      />
      {isSuggestingEnabled && !isConfigLoading && (
        <Box>
          <SuggestionTimingTypeCardsSelect
            suggestionsConfig={suggestionsConfig}
            handleConfigChange={handleConfigChange}
          />
          <Box
            component="hr"
            sx={{ borderTop: theme.palette.grey[300], mb: 3, mt: 3 }}
          />
          {suggestionsConfig.suggestionTimingType === "RECURRING" && (
            <RecurringInputs
              suggestionsConfig={suggestionsConfig}
              handleConfigChange={handleConfigChange}
            />
          )}
          {suggestionsConfig.suggestionTimingType === "DUE_DATE" && (
            <DueDateInputs
              suggestionsConfig={suggestionsConfig}
              handleConfigChange={handleConfigChange}
            />
          )}
          {suggestionsConfig.suggestionTimingType === "SOON" && (
            <Box mt={3}>
              <Typography variant="subtitle2" color="textSecondary">
                You'll see this task in your suggestions until it's been done.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
