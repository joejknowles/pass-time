import { GraphQLError } from "graphql";
import { Context, prisma } from "../helpers/helpers";
import { TZDateMini } from "@date-fns/tz";

function utcRangeForLocalDate(
  {
    date,
  }: {
    date: string;
  },
  timeZone: string
): [Date, Date] {
  const [y, m, d] = date.split("-").map(Number);

  // Local start of day: 00:00 in the user's zone
  const startLocal = new TZDateMini(y, m - 1, d, timeZone);
  startLocal.setHours(0, 0, 0, 0);

  // Next local day 00:00 (not +24h — handles 23/25h DST days)
  const endLocal = new TZDateMini(startLocal, timeZone);
  endLocal.setDate(endLocal.getDate() + 1);
  endLocal.setHours(0, 0, 0, 0);

  // Persist as UTC instants
  return [new Date(startLocal.getTime()), new Date(endLocal.getTime())];
}

export const taskInstancesQueryResolver = async (
  _parent: any,
  args: {
    input: {
      date: string;
    };
  },
  context: Context
) => {
  if (!context.user) {
    throw new GraphQLError("User not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }

  const [startUtc, endUtc] = utcRangeForLocalDate(args.input, context.timeZone);
  const startTimeIsToday = {
    startTime: {
      gte: startUtc,
      lt: endUtc,
    },
  };

  return await prisma.taskInstance.findMany({
    where: {
      ...startTimeIsToday,
      userId: context.user.id,
    },
    include: {
      user: true,
      task: {
        include: {
          parentTasks: true,
          childTasks: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });
};
