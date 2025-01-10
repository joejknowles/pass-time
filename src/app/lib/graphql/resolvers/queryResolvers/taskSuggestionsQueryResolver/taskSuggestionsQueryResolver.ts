import { GraphQLError } from 'graphql';
import { Context } from '../../helpers/helpers';
import { addBalanceTargetGroups } from './addBalanceTargetGroups';


export const taskSuggestionsQueryResolver = async (_parent: any, _args: any, context: Context) => {
    if (!context.user) {
        throw new GraphQLError('User not authenticated', {
            extensions: {
                code: 'UNAUTHENTICATED',
            },
        });
    }

    let taskGroups: any[] = [];

    taskGroups = await addBalanceTargetGroups(taskGroups, context.user.id);

    return taskGroups;
};
