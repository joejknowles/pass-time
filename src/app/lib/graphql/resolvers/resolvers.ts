// gradually migrating to `throw new GraphQLError` instead of `throw new Error`
import { queryResolvers } from './queryResolvers';
import { additionalFields } from './additionalFields';
import { mutationResolvers } from './mutationResolvers';

export const resolvers = {
    Query: queryResolvers,
    Mutation: mutationResolvers,
    ...additionalFields
};
