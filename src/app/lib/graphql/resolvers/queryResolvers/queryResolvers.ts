// gradually migrating to `throw new GraphQLError` instead of `throw new Error`
import { Context } from '../helpers/helpers';

import { tasks } from './tasks';
import { taskInstances } from './taskInstances';
import { balanceTargets } from './balanceTargets';
import { taskSuggestions } from './taskSuggestions';
import { taskSuggestionConfig } from './taskSuggestionConfig';

export const queryResolvers = {
    tasks,
    taskInstances,
    balanceTargets,
    taskSuggestions,
    taskSuggestionConfig,
};