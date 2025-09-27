import { tasksQueryResolver } from "./tasksQueryResolver";
import { taskInstancesQueryResolver } from "./taskInstancesQueryResolver";
import { balanceTargetsQueryResolver } from "./balanceTargetsQueryResolver";
import { taskSuggestionsQueryResolver } from "./taskSuggestionsQueryResolver/taskSuggestionsQueryResolver";
import { taskSuggestionConfigQueryResolver } from "./taskSuggestionConfigQueryResolver";
import { taskQueryResolver } from "./taskQueryResolver";

export const queryResolvers = {
  tasks: tasksQueryResolver,
  taskInstances: taskInstancesQueryResolver,
  balanceTargets: balanceTargetsQueryResolver,
  taskSuggestions: taskSuggestionsQueryResolver,
  taskSuggestionConfig: taskSuggestionConfigQueryResolver,
  task: taskQueryResolver,
};
