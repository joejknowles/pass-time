import { GraphQLError } from "graphql";
import { Context, prisma } from "../helpers/helpers";

export const taskSuggestionConfigQueryResolver = async (
  _parent: any,
  args: { taskId: number },
  context: Context
) => {
  if (!context.user) {
    throw new GraphQLError("User not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }

  return (
    await prisma.taskSuggestionConfig.findMany({
      where: { taskId: args.taskId, userId: context.user.id },
    })
  )[0];
};
