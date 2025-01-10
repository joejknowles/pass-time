import { GraphQLError } from 'graphql';
import { Context, prisma } from '../helpers/helpers';

export const balanceTargets = async (_parent: any, _args: any, context: Context) => {
    if (!context.user) {
        throw new GraphQLError('User not authenticated', {
            extensions: {
                code: 'UNAUTHENTICATED',
            },
        });
    }
    return await prisma.balanceTarget.findMany({
        where: { userId: context.user.id },
        include: { task: true },
    });
};
