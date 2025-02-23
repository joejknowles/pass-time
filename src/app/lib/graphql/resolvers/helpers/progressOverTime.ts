import { prisma } from "./helpers";

export interface DateRange {
    from: Date;
    to: Date;
}

export const progressOverTime = async (taskIds: number[], userId: number, range: DateRange, granularity: 'DAILY'): Promise<{ date: string; value: number }[]> => {
    const result = await prisma.$queryRawUnsafe<{ date: Date; value: number }[]>(`
        WITH RECURSIVE date_series AS (
            SELECT $2::DATE AS date
            UNION ALL
            SELECT (date + INTERVAL '1 day')::DATE
            FROM date_series
            WHERE (date + INTERVAL '1 day')::DATE <= $3::DATE
        )
        SELECT ds.date, COALESCE(SUM(ti.duration)::INT, 0) AS "value"
        FROM date_series ds
        LEFT JOIN "TaskInstance" ti ON ti."taskId" = ANY($1) AND ti."userId" = $4 AND ti."startTime"::DATE = ds.date
        GROUP BY ds.date
        ORDER BY ds.date;
    `, taskIds, range.from, range.to, userId);

    return result.map(row => ({
        date: row.date.toISOString().split('T')[0],
        value: row.value
    }));
};
