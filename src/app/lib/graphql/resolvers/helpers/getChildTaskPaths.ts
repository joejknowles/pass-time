import { prisma } from "./helpers";

export const getChildTaskPaths = async (
  taskId: number,
  userId: number
): Promise<{ id: number; title: string }[][]> => {
  const result = await prisma.$queryRawUnsafe<
    { path: { id: number; title: string }[] }[]
  >(
    `
        WITH RECURSIVE task_paths AS (
            -- Start recursion with the child tasks of the main taskId
            SELECT ARRAY[json_build_object('id', t.id, 'title', t.title, 'defaultDuration', t."defaultDuration", 'isSuggestingEnabled', t."isSuggestingEnabled")] AS path, 1 AS depth
            FROM "_ParentChildTasks" pct
            JOIN "Task" t ON t.id = pct."B" AND t."userId" = $2
            WHERE pct."A" = $1

            UNION ALL

            -- Build paths recursively
            SELECT tp.path || json_build_object('id', t.id, 'title', t.title, 'defaultDuration', t."defaultDuration", 'isSuggestingEnabled', t."isSuggestingEnabled"), tp.depth + 1
            FROM task_paths tp
            JOIN "_ParentChildTasks" pct ON (tp.path[array_length(tp.path, 1)]->>'id')::INTEGER = pct."A"
            JOIN "Task" t ON t.id = pct."B" AND t."userId" = $2
        )
        SELECT DISTINCT ON (path[array_length(path, 1)]->>'id') path
        FROM task_paths
        ORDER BY path[array_length(path, 1)]->>'id', depth DESC;
    `,
    taskId,
    userId
  );

  return result.map(({ path }) => path);
};
