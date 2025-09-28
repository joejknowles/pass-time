import { prisma } from "./helpers";

export async function getNestedChildTaskIds(
  taskId: number,
  userId: number,
  maxDepthCap = 20
): Promise<{ taskIds: number[]; maxDepth: number; cycleDetected: boolean }> {
  const rows = await prisma.$queryRaw<
    { id: number; depth: number; cy: boolean }[]
  >`
    WITH RECURSIVE walk(id, path, depth) AS (
      SELECT t.id, ARRAY[${taskId}, t.id]::int[], 1
      FROM "_ParentChildTasks" pct
      JOIN "Task" t ON t.id = pct."B" AND t."userId" = ${userId}
      WHERE pct."A" = ${taskId}

      UNION ALL

      SELECT t.id, w.path || t.id, w.depth + 1
      FROM walk w
      JOIN "_ParentChildTasks" pct ON w.id = pct."A"
      JOIN "Task" t ON t.id = pct."B" AND t."userId" = ${userId}
      WHERE w.depth < ${maxDepthCap}
        AND NOT (t.id = ANY (w.path))
    ),
    cycles AS (
      SELECT 1
      FROM walk w
      JOIN "_ParentChildTasks" pct ON w.id = pct."A"
      JOIN "Task" t ON t.id = pct."B" AND t."userId" = ${userId}
      WHERE t.id = ANY (w.path)  -- attempted revisit ⇒ cycle present
      LIMIT 1
    )
    SELECT w.id, w.depth, EXISTS(SELECT 1 FROM cycles) AS cy
    FROM walk w
    GROUP BY w.id, w.depth, cy;
  `;

  const taskIds = [...new Set(rows.map((r) => r.id))];
  const maxDepth = rows.length
    ? Math.max(...rows.map((r) => Number(r.depth)))
    : 0;
  const cycleDetected = rows.some((r) => r.cy);
  return { taskIds, maxDepth, cycleDetected };
}
