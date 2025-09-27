// gradually migrating to `throw new GraphQLError` instead of `throw new Error`
import { GraphQLError } from "graphql";
import { prisma } from "./helpers";

export const isTaskHierarchyValid = async (
  taskId: number,
  parentTaskId: number,
  userId: number
) => {
  if (taskId === parentTaskId) {
    throw new GraphQLError("Task cannot be parent of itself", {
      extensions: {
        code: "BAD_USER_INPUT",
        fieldName: "parentTaskId",
      },
    });
  }

  const checkUpwards = async (
    parentTaskId: number,
    mainTaskId: number,
    depth: number
  ): Promise<number> => {
    if (parentTaskId === mainTaskId) {
      throw new GraphQLError("Cyclic task hierarchy detected", {
        extensions: {
          code: "BAD_USER_INPUT",
          fieldName: "parentTaskId",
        },
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: parentTaskId, userId },
      include: { parentTasks: true },
    });

    let maxDepth = depth;
    if (task) {
      for (const parent of task.parentTasks) {
        maxDepth = Math.max(
          maxDepth,
          await checkUpwards(parent.id, mainTaskId, depth + 1)
        );
      }
    }
    return maxDepth;
  };

  const checkDownwards = async (
    childTaskId: number,
    requestedParentTaskId: number,
    depth: number
  ): Promise<number> => {
    if (requestedParentTaskId === childTaskId) {
      throw new GraphQLError("Cyclic task hierarchy detected", {
        extensions: {
          code: "BAD_USER_INPUT",
          fieldName: "parentTaskId",
        },
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: childTaskId, userId },
      include: { childTasks: true },
    });

    let maxDepth = depth;
    if (task) {
      for (const child of task.childTasks) {
        maxDepth = Math.max(
          maxDepth,
          await checkDownwards(child.id, requestedParentTaskId, depth + 1)
        );
      }
    }
    return maxDepth;
  };

  const upwardDepth = await checkUpwards(parentTaskId, taskId, 1);
  const downwardDepth = await checkDownwards(taskId, parentTaskId, 1);

  if (upwardDepth + downwardDepth - 1 > 20) {
    throw new GraphQLError(
      "Can't be added – task hierarchies can't be more than 20 tasks long",
      {
        extensions: {
          code: "BAD_USER_INPUT",
          fieldName: "parentTaskId",
        },
      }
    );
  }

  return true;
};
