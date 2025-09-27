import { GraphQLError } from "graphql";
import { Context, prisma } from "../helpers/helpers";

export const taskQueryResolver = async (
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

  const task = await prisma.task.findUnique({
    where: { id: args.taskId, userId: context.user.id },
    include: {
      user: true,
      taskInstances: {
        orderBy: { startTime: "desc" },
      },
      parentTasks: true,
      childTasks: true,
    },
  });

  if (!task) {
    throw new GraphQLError("Task not found", {
      extensions: {
        code: "NOT_FOUND",
      },
    });
  }

  return task;
};
