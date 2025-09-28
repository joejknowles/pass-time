import { GraphQLError } from "graphql";
import {
  CAP,
  ensureTask,
  existsPathDown,
  MAX_LEN,
  maxDepthDown,
  maxDepthUp,
} from "./validateAddRelationshipHelpers";

export async function validateAddChild(
  taskId: number,
  newChildId: number,
  userId: number
) {
  if (taskId === newChildId)
    throw new GraphQLError("Task cannot be child of itself", {
      extensions: { code: "NO_SELF_RELATIONSHIPS", fieldName: "childTaskId" },
    });

  await ensureTask(userId, taskId, "taskId");
  await ensureTask(userId, newChildId, "childTaskId");

  // cycle: path newChild ⇒ … ⇒ task?
  if (await existsPathDown(newChildId, taskId, userId)) {
    throw new GraphQLError(
      "Requested child is already an ancestor of this task – no circular relationships allowed",
      {
        extensions: {
          code: "NO_CYCLIC_RELATIONSHIPS",
          fieldName: "childTaskId",
        },
      }
    );
  }

  // length cap through the new edge: (ancestors of task) + (descendants of child) - 1
  const up = await maxDepthUp(taskId, userId, CAP);
  const down = await maxDepthDown(newChildId, userId, CAP);
  if (up + down - 1 > MAX_LEN) {
    throw new GraphQLError(
      "Task hierarchies can't be more than 20 tasks long",
      {
        extensions: {
          code: "MAX_TASK_HIERARCHY_LENGTH",
          fieldName: "childTaskId",
        },
      }
    );
  }

  return true;
}
