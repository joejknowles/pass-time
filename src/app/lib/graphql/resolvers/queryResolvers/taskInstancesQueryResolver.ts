import { GraphQLError } from 'graphql';
import { Context, prisma } from '../helpers/helpers';

export const taskInstancesQueryResolver = async (_parent: any, args: {
    input: {
        date: string;
    }
}, context: Context) => {
    if (!context.user) {
        throw new GraphQLError('User not authenticated', {
            extensions: {
                code: 'UNAUTHENTICATED',
            },
        });
    }

    const startTimeIsToday = {
        startTime: {
            gte: new Date(args.input.date),
            lt: new Date(new Date(args.input.date).getTime() + 24 * 60 * 60 * 1000),
        }
    }

    return await prisma.taskInstance.findMany({
        where: {
            ...startTimeIsToday,
            userId: context.user.id
        },
        include: {
            user: true,
            task: {
                include: {
                    parentTasks: true,
                    childTasks: true,
                },
            }
        },
    });
};
