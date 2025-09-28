import { GraphQLError } from "graphql";
import {
  CAP,
  ensureTask,
  existsPathDown,
  MAX_LEN,
  maxDepthDown,
  maxDepthUp,
} from "./validateAddRelationshipHelpers";

export async function validateAddParent(
  taskId: number,
  newParentId: number,
  userId: number
) {
  if (taskId === newParentId)
    throw new GraphQLError("Task cannot be parent of itself", {
      extensions: { code: "NO_SELF_RELATIONSHIPS", fieldName: "parentTaskId" },
    });

  await ensureTask(userId, taskId, "taskId");
  await ensureTask(userId, newParentId, "parentTaskId");

  // cycle: path task ⇒ … ⇒ newParent?
  if (await existsPathDown(taskId, newParentId, userId)) {
    throw new GraphQLError(
      "Requested parent is already a descendant of this task – no circular relationships allowed",
      {
        extensions: {
          code: "NO_CYCLIC_RELATIONSHIPS",
          fieldName: "parentTaskId",
        },
      }
    );
  }

  // length cap through the new edge: (ancestors of parent) + (descendants of task) - 1
  const up = await maxDepthUp(newParentId, userId, CAP);
  const down = await maxDepthDown(taskId, userId, CAP);
  if (up + down - 1 > MAX_LEN) {
    throw new GraphQLError(
      "Task hierarchies can't be more than 20 tasks long",
      {
        extensions: {
          code: "MAX_TASK_HIERARCHY_LENGTH",
          fieldName: "parentTaskId",
        },
      }
    );
  }

  return true;
}
