import { GraphQLError } from 'graphql';
import { Context, prisma } from '../helpers/helpers';

export const tasksQueryResolver = async (_parent: any, _args: any, context: Context) => {
    if (!context.user) {
        throw new GraphQLError('User not authenticated', {
            extensions: {
                code: 'UNAUTHENTICATED',
            },
        });
    }

    const tasks = await prisma.task.findMany({
        where: { userId: context.user.id },
        include: { user: true, taskInstances: true, parentTasks: true, childTasks: true },
        orderBy: { taskInstances: { _count: 'desc' } },
    });

    return tasks.map(task => ({
        ...task,
        defaultDuration: task.defaultDuration || 30,
    }));
};
