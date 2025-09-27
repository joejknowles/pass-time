import { GraphQLError } from "graphql";
import { Context, prisma } from "../helpers/helpers";

export const tasksQueryResolver = async (
  _parent: any,
  _args: any,
  context: Context
) => {
  if (!context.user) {
    throw new GraphQLError("User not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }

  const twoWeeksAgoDate = new Date();
  twoWeeksAgoDate.setDate(twoWeeksAgoDate.getDate() - 14);

  const tasks = await prisma.task.findMany({
    where: { userId: context.user.id },
    include: {
      user: true,
      taskInstances: {
        orderBy: { startTime: "desc" },
        where: {
          startTime: {
            gte: twoWeeksAgoDate,
          },
        },
      },
      parentTasks: true,
      childTasks: true,
    },
  });

  return tasks
    .map((task) => ({
      ...task,
      defaultDuration: task.defaultDuration || 30,
    }))
    .sort((a, b) => {
      if (a.taskInstances.length > b.taskInstances.length) {
        return -1;
      } else if (a.taskInstances.length < b.taskInstances.length) {
        return 1;
      } else {
        return 0;
      }
    });
};
