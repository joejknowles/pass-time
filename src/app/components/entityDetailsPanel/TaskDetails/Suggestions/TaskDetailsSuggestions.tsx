import { Box, FormControlLabel, Switch } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { RecurringOrNotCardsSelect } from "./RecurringOrNotCardsSelect";
import { RecurringInputs } from "./RecurringInputs";
import { TaskSuggestionsConfig, RECURRING_TYPES } from "./types";
import { GET_TASK_SUGGESTION_CONFIG } from "@/app/lib/graphql/queries";
import { UPDATE_TASK_SUGGESTION_CONFIG, UPDATE_TASK } from "@/app/lib/graphql/mutations";
import { Task } from "@/app/components/dayGrid/types";

interface TaskDetailsSuggestionsProps {
    task: Task;
}

export const TaskDetailsSuggestions = ({ task }: TaskDetailsSuggestionsProps) => {
    const [isSuggestingEnabled, setIsSuggestingEnabled] = useState<boolean>(task.isSuggestingEnabled);
    const [suggestionsConfig, setSuggestionsConfig] = useState<TaskSuggestionsConfig>({
        recurringOrOnce: "RECURRING",
        daysSinceLastOccurrence: 3,
        specificDays: "SUNDAY",
        recurringType: RECURRING_TYPES.DAYS_SINCE_LAST_OCCURRENCE
    });

    const { data } = useQuery(GET_TASK_SUGGESTION_CONFIG, {
        variables: { taskId: task.id },
    });

    const [updateTaskSuggestionConfig] = useMutation(UPDATE_TASK_SUGGESTION_CONFIG);
    const [updateTask] = useMutation(UPDATE_TASK);

    useEffect(() => {
        if (data?.taskSuggestionConfig) {
            const nonEmptyValues = Object.fromEntries(Object.entries(data.taskSuggestionConfig).filter(([, value]) => value !== null && value !== undefined));
            setSuggestionsConfig(suggestionsConfig => ({ ...suggestionsConfig, ...nonEmptyValues }));
        }
    }, [data]);

    const handleConfigChange = (key: keyof TaskSuggestionsConfig, value: any) => {
        setSuggestionsConfig(prevConfig => ({ ...prevConfig, [key]: value }));

        updateTaskSuggestionConfig({
            variables: {
                input: {
                    taskId: task.id,
                    [key]: value,
                },
            },
        });
    };

    const handleSuggestionsEnabledChange = useCallback(() => {
        setIsSuggestingEnabled(value => {
            const newValue = !value;
            return newValue;
        });

        const newValue = !isSuggestingEnabled;
        updateTask({
            variables: {
                input: {
                    id: task.id,
                    isSuggestingEnabled: newValue,
                },
            },
            optimisticResponse: {
                updateTask: {
                    ...task,
                    isSuggestingEnabled: newValue,
                },
            },
        });
    }, [isSuggestingEnabled]);

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
                isSuggestingEnabled && (
                    <Box>
                        <RecurringOrNotCardsSelect
                            suggestionsConfig={suggestionsConfig}
                            setSuggestionsConfig={(config) => handleConfigChange('recurringOrOnce', config.recurringOrOnce)}
                        />
                        {suggestionsConfig.recurringOrOnce === "RECURRING" && (
                            <RecurringInputs
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
