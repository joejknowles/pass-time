import { prisma } from "./helpers";

export const getNestedChildTaskIds = async (taskId: number, userId: number): Promise<number[]> => {
    const result = await prisma.$queryRawUnsafe<{ id: number }[]>(`
        WITH RECURSIVE task_ids AS (
            -- Start recursion with the child tasks of the main taskId
            SELECT t.id
            FROM "_ParentChildTasks" pct
            JOIN "Task" t ON t.id = pct."B" AND t."userId" = $2
            WHERE pct."A" = $1

            UNION ALL

            -- Build paths recursively
            SELECT t.id
            FROM task_ids ti
            JOIN "_ParentChildTasks" pct ON ti.id = pct."A"
            JOIN "Task" t ON t.id = pct."B" AND t."userId" = $2
        )
        SELECT id
        FROM task_ids;
    `, taskId, userId);

    return result.map(({ id }) => id);
};
