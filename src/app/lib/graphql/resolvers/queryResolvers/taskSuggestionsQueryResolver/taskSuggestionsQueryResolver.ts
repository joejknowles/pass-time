import { GraphQLError } from 'graphql';
import { Context } from '../../helpers/helpers';
import { addBalanceTargetGroups } from './addBalanceTargetGroups';
import { addScheduledSuggestionTaskGroups } from './addScheduledSuggestionTaskGroups';

export const taskSuggestionsQueryResolver = async (_parent: any, _args: any, context: Context) => {
    if (!context.user) {
        throw new GraphQLError('User not authenticated', {
            extensions: {
                code: 'UNAUTHENTICATED',
            },
        });
    }

    let taskGroups: any[] = [];

    taskGroups = await addScheduledSuggestionTaskGroups(taskGroups, context.user.id);
    taskGroups = await addBalanceTargetGroups(taskGroups, context.user.id);

    return taskGroups;
};
