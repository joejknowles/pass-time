import { prisma } from "../../helpers/helpers";
import { getChildTaskPaths } from "../../helpers/getChildTaskPaths";

export const addBalanceTargetGroups = async (
  taskGroups: any[],
  userId: number
) => {
  const balanceTargets = await prisma.balanceTarget.findMany({
    where: { userId: userId },
    include: { task: true },
  });

  const priorityTargets = balanceTargets.filter((target) => {
    const isOnlyTargetForTask =
      balanceTargets.filter((t) => t.taskId === target.taskId).length === 1;
    if (isOnlyTargetForTask) {
      return true;
    } else {
      return target.timeWindow === "DAILY";
    }
  });

  for (const balanceTarget of priorityTargets) {
    const childTaskPaths = await getChildTaskPaths(
      balanceTarget.task.id,
      userId
    );

    const remainingChildTasks: { id: number; title: string }[][] = JSON.parse(
      JSON.stringify(childTaskPaths)
    );
    const orderedTaskList: { id: number; title: string }[] = [];

    while (remainingChildTasks.every((path) => path.length > 0)) {
      let longestPathLength = 0;
      for (const path of remainingChildTasks) {
        if (path.length > longestPathLength) {
          longestPathLength = path.length;
        }
      }

      for (const path of remainingChildTasks) {
        if (path.length === longestPathLength) {
          const task = path.pop() as {
            id: number;
            title: string;
            isSuggestingEnabled: boolean;
          };
          if (
            task.isSuggestingEnabled &&
            !orderedTaskList.find((t) => t.id === task.id)
          ) {
            orderedTaskList.push(task);
          }
        }
      }
    }

    taskGroups.push({
      name: balanceTarget.task.title,
      tasks:
        orderedTaskList.length > 0 ? orderedTaskList : [balanceTarget.task],
      type: "BALANCE_TARGET",
      data: balanceTarget,
    });
  }

  return taskGroups;
};
