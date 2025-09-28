import { GraphQLError } from "graphql";
import { prisma } from "../helpers";

export const MAX_LEN = 20;
export const CAP = MAX_LEN + 1

export async function existsPathDown(
  fromId: number,
  toId: number,
  userId: number
): Promise<boolean> {
  const r = await prisma.$queryRaw<{ exists: boolean }[]>`
    WITH RECURSIVE walk(id) AS (
      SELECT t.id
      FROM "_ParentChildTasks" pct
      JOIN "Task" t ON t.id = pct."B" AND t."userId" = ${userId}
      WHERE pct."A" = ${fromId}
      UNION
      SELECT t.id
      FROM walk w
      JOIN "_ParentChildTasks" pct ON w.id = pct."A"
      JOIN "Task" t ON t.id = pct."B" AND t."userId" = ${userId}
    )
    SELECT EXISTS (SELECT 1 FROM walk WHERE id = ${toId}) AS exists;
  `;
  return r[0]?.exists ?? false;
}

export async function maxDepthDown(
  fromId: number,
  userId: number,
  cap = CAP
): Promise<number> {
  const r = await prisma.$queryRaw<{ maxd: number }[]>`
    WITH RECURSIVE walk(id, depth) AS (
      SELECT t.id, 1
      FROM "_ParentChildTasks" pct
      JOIN "Task" t ON t.id = pct."B" AND t."userId" = ${userId}
      WHERE pct."A" = ${fromId}
      UNION ALL
      SELECT t.id, w.depth + 1
      FROM walk w
      JOIN "_ParentChildTasks" pct ON w.id = pct."A"
      JOIN "Task" t ON t.id = pct."B" AND t."userId" = ${userId}
      WHERE w.depth < ${cap}
    )
    SELECT COALESCE(MAX(depth), 0) AS maxd FROM walk;
  `;
  return Number(r[0]?.maxd ?? 0);
}

export async function maxDepthUp(
  fromId: number,
  userId: number,
  cap = CAP
): Promise<number> {
  const r = await prisma.$queryRaw<{ maxd: number }[]>`
    WITH RECURSIVE walk(id, depth) AS (
      SELECT t.id, 1
      FROM "_ParentChildTasks" pct
      JOIN "Task" t ON t.id = pct."A" AND t."userId" = ${userId}
      WHERE pct."B" = ${fromId}
      UNION ALL
      SELECT t.id, w.depth + 1
      FROM walk w
      JOIN "_ParentChildTasks" pct ON w.id = pct."B"
      JOIN "Task" t ON t.id = pct."A" AND t."userId" = ${userId}
      WHERE w.depth < ${cap}
    )
    SELECT COALESCE(MAX(depth), 0) AS maxd FROM walk;
  `;
  return Number(r[0]?.maxd ?? 0);
}

export async function ensureTask(
  userId: number,
  id: number,
  fieldName: string
) {
  const t = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!t) {
    throw new GraphQLError("Task not found", {
      extensions: { code: "BAD_USER_INPUT", fieldName },
    });
  }
}
