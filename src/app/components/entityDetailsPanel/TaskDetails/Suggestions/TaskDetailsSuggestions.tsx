import { Box, FormControlLabel, Switch } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { RecurringOrNotCardsSelect } from "./RecurringOrNotCardsSelect";
import { RecurringInputs } from "./RecurringInputs";
import { OneOffInputs } from "./OneOffInputs";
import { TaskSuggestionsConfig, RECURRING_TYPES } from "./types";
import { GET_TASK_SUGGESTION_CONFIG } from "@/app/lib/graphql/queries";
import { UPDATE_TASK_SUGGESTION_CONFIG } from "@/app/lib/graphql/mutations";
import { Task } from "@/app/components/dayGrid/types";
import { useTasks } from "@/app/lib/hooks/useTasks";

interface TaskDetailsSuggestionsProps {
    task: Task;
}

export const TaskDetailsSuggestions = ({ task }: TaskDetailsSuggestionsProps) => {
    const [isSuggestingEnabled, setIsSuggestingEnabled] = useState<boolean>(task.isSuggestingEnabled);
    const [suggestionsConfig, setSuggestionsConfig] = useState<TaskSuggestionsConfig>({
        recurringOrOnce: "RECURRING",
        daysSinceLastOccurrence: 3,
        specificDays: "SUNDAY",
        recurringType: RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE,
        // tomorrow
        oneOffDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0],
        oneOffDateType: "BEFORE_OR_ON",
    });

    const { data: suggestionConfigData, loading: isConfigLoading, refetch: refetchSuggestionConfig } = useQuery(GET_TASK_SUGGESTION_CONFIG, {
        variables: { taskId: task.id },
    });

    const [updateTaskSuggestionConfig] = useMutation(UPDATE_TASK_SUGGESTION_CONFIG);
    const { updateTask } = useTasks();

    useEffect(() => {
        if (suggestionConfigData?.taskSuggestionConfig) {
            const nonEmptyValues = Object.fromEntries(Object.entries(suggestionConfigData.taskSuggestionConfig).filter(([, value]) => value !== null && value !== undefined));
            setSuggestionsConfig(suggestionsConfig => ({ ...suggestionsConfig, ...nonEmptyValues }));
        }
    }, [suggestionConfigData]);

    const handleConfigChange = async (newValues: Partial<TaskSuggestionsConfig>) => {
        setSuggestionsConfig(prevConfig => ({ ...prevConfig, ...newValues }));

        await updateTaskSuggestionConfig({
            variables: {
                input: {
                    taskId: task.id,
                    ...newValues
                },
            },
        });
        refetchSuggestionConfig();
    };

    const handleSuggestionsEnabledChange = useCallback(async () => {
        setIsSuggestingEnabled(value => {
            const newValue = !value;
            return newValue;
        });

        const newValue = !isSuggestingEnabled;
        if (newValue) {
            setSuggestionsConfig(config => ({
                ...config,
                recurringType: RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE
            }));
            await updateTaskSuggestionConfig({
                variables: {
                    input: {
                        taskId: task.id,
                        recurringOrOnce: suggestionsConfig.recurringOrOnce,
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
                label={`Suggestions are ${isSuggestingEnabled ? "enabled" : "disabled"}`}
            />
            {
                isSuggestingEnabled && !isConfigLoading && (
                    <Box>
                        <RecurringOrNotCardsSelect
                            suggestionsConfig={suggestionsConfig}
                            handleConfigChange={handleConfigChange}
                        />
                        {suggestionsConfig.recurringOrOnce === "RECURRING" && (
                            <RecurringInputs
                                suggestionsConfig={suggestionsConfig}
                                handleConfigChange={handleConfigChange}
                            />
                        )}
                        {suggestionsConfig.recurringOrOnce === "ONE_OFF" && (
                            <OneOffInputs
                                suggestionsConfig={suggestionsConfig}
                                handleConfigChange={handleConfigChange}
                            />
                        )}
                    </Box>
                )
            }
        </Box>
    );
};
