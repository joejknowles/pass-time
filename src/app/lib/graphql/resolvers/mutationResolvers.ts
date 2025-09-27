// gradually migrating to `throw new GraphQLError` instead of `throw new Error`
import { admin } from "@/lib/firebaseAdmin";
import { BalanceTarget } from "@prisma/client";
import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { Context, prisma } from "./helpers/helpers";
import { isTaskHierarchyValid } from "./helpers/isTaskHierarchyValid";
import { TZDateMini } from "@date-fns/tz";

const validSpecificDays = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "EVERYDAY",
  "WEEKDAY",
  "WEEKEND",
];

function toUtcDateUsingTZ(
  {
    date, // "YYYY-MM-DD"
    hour, // 0-23
    minute, // 0-59
  }: {
    date: string;
    hour: number;
    minute: number;
  },
  timeZone: string
) {
  console.log("toUtcDateUsingTZ input:", { date, hour, minute, timeZone });
  const [y, m, d] = date.split("-").map(Number);

  // Create a date anchored to the user's timezone at local midnight
  const tz = new TZDateMini(y, m - 1, d, timeZone);

  // Set the wall clock time in that timezone
  tz.setHours(hour, minute, 0, 0);

  console.log("output UTC date:", new Date(tz.getTime()));
  // Persist as a real UTC instant
  return new Date(tz.getTime()); // JS Date in UTC
}

export const mutationResolvers = {
  createUser: async (
    _: any,
    args: { email: string; firebaseId: string; token: string }
  ) => {
    const decodedToken = await admin.auth().verifyIdToken(args.token);

    if (decodedToken.uid !== args.firebaseId) {
      throw new Error("Firebase ID does not match token");
    }

    const result = await prisma.user.create({
      data: { email: args.email, firebaseId: args.firebaseId },
    });

    return result;
  },
  createTask: async (
    _parent: unknown,
    args: {
      input: {
        title: string;
      };
    },
    context: Context,
    _info: GraphQLResolveInfo
  ) => {
    const { user } = context;

    if (!user) {
      throw new GraphQLError("User not authenticated", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }

    return await prisma.task.create({
      data: {
        title: args.input.title,
        userId: user.id,
        isSuggestingEnabled: true,
        suggestionConfigs: {
          createMany: {
            data: {
              userId: user.id,
              suggestionTimingType: "SOON",
            },
          },
        },
      },
      include: {
        user: true,
        taskInstances: true,
        parentTasks: true,
        childTasks: true,
      },
    });
  },
  createTaskInstance: async (
    _parent: unknown,
    args: {
      input: {
        title?: string;
        taskId?: number;
        start: {
          date: string;
          hour: number;
          minute: number;
        };
        duration: number;
      };
    },
    context: Context,
    _info: GraphQLResolveInfo
  ) => {
    const { user } = context;

    if (!user) {
      throw new GraphQLError("User not authenticated", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }

    let task = null;

    if (!args.input.title && !args.input.taskId) {
      throw new GraphQLError("No task title or ID provided", {
        extensions: {
          code: "BAD_USER_INPUT",
        },
      });
    }

    if (args.input.title && !args.input.taskId) {
      task = await prisma.task.create({
        data: {
          title: args.input.title,
          userId: user.id,
        },
        include: {
          user: true,
          taskInstances: true,
          parentTasks: true,
          childTasks: true,
        },
      });
    } else if (args.input.taskId) {
      task = await prisma.task.findUnique({
        where: { id: args.input.taskId, userId: user.id },
        include: {
          user: true,
          taskInstances: true,
          parentTasks: true,
          childTasks: true,
        },
      });
    }

    if (!task) {
      throw new Error("No task found or created");
    }

    const newTaskInstance = await prisma.taskInstance.create({
      data: {
        userId: user.id,
        taskId: task?.id,
        startTime: toUtcDateUsingTZ(args.input.start, context.timeZone),
        duration: task.defaultDuration || 30,
      },
      include: {
        user: true,
        task: true,
      },
    });

    return newTaskInstance;
  },
  updateTaskInstance: async (
    _parent: unknown,
    args: {
      input: {
        id: string;
        title?: string;
        duration?: number;
        start?: { date?: string; hour?: number; minute?: number };
      };
    },
    context: Context,
    _info: GraphQLResolveInfo
  ) => {
    const { user } = context;
    const { id, title, duration, start } = args.input;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const taskInstanceId = parseInt(id, 10);
    if (isNaN(taskInstanceId)) {
      throw new Error("Invalid TaskInstance ID");
    }

    let taskInstance = await prisma.taskInstance.findUnique({
      where: { id: taskInstanceId, userId: user.id },
      include: { user: true, task: true },
    });

    if (!taskInstance) {
      throw new Error("Task instance not found");
    }

    let startTime = null;
    if (start?.date && start?.hour != null && start?.minute != null) {
      startTime = toUtcDateUsingTZ(
        start as { date: string; hour: number; minute: number },
        context.timeZone
      );
    }

    if (startTime || duration) {
      taskInstance = await prisma.taskInstance.update({
        where: { id: taskInstanceId, userId: user.id },
        data: {
          ...(duration && { duration }),
          ...(startTime && { startTime }),
        },
        include: { task: true, user: true },
      });
    }

    if (title) {
      const task = await prisma.task.update({
        where: { id: taskInstance.taskId, userId: user.id },
        data: { title },
        include: {
          user: true,
          taskInstances: true,
          parentTasks: true,
          childTasks: true,
        },
      });
      taskInstance.task = task;
    }

    return taskInstance;
  },
  deleteTaskInstance: async (
    _: any,
    args: { id: string },
    context: Context
  ) => {
    const { user } = context;
    const taskInstanceId = parseInt(args.id, 10);

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (isNaN(taskInstanceId)) {
      throw new Error("Invalid TaskInstance ID");
    }

    const taskInstance = await prisma.taskInstance.findUnique({
      where: { id: taskInstanceId, userId: user.id },
      include: {
        user: true,
        task: {
          include: {
            taskInstances: true,
            parentTasks: true,
            childTasks: true,
            suggestionConfigs: true,
          },
        },
      },
    });

    if (!taskInstance) {
      throw new Error("Task instance not found");
    }

    const taskId = taskInstance.taskId;
    const wasOnlyUseOfTask =
      taskInstance.task.taskInstances.length === 1 &&
      taskInstance.task.parentTasks.length === 0 &&
      taskInstance.task.childTasks.length === 0 &&
      taskInstance.task.suggestionConfigs.length === 0;

    await prisma.taskInstance.delete({
      where: { id: taskInstanceId, userId: user.id },
    });

    if (wasOnlyUseOfTask) {
      await prisma.task.delete({
        where: { id: taskId, userId: user.id },
      });
    }

    return true;
  },
  updateTask: async (
    _parent: unknown,
    args: {
      input: {
        id: string;
        title?: string;
        parentTaskId?: number;
        defaultDuration?: number;
        isSuggestingEnabled?: boolean;
      };
    },
    context: Context,
    _info: GraphQLResolveInfo
  ) => {
    const { user } = context;
    const { id, title, parentTaskId, defaultDuration, isSuggestingEnabled } =
      args.input;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      throw new Error("Invalid Task ID");
    }

    let task = await prisma.task.findUnique({
      where: { id: taskId, userId: user.id },
      include: {
        user: true,
        taskInstances: true,
        parentTasks: true,
        childTasks: true,
      },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    if (
      title ||
      defaultDuration !== undefined ||
      isSuggestingEnabled !== undefined
    ) {
      task = await prisma.task.update({
        where: { id: taskId, userId: user.id },
        data: {
          ...(title && { title }),
          ...(defaultDuration !== undefined && { defaultDuration }),
          ...(isSuggestingEnabled !== undefined && { isSuggestingEnabled }),
        },
        include: {
          user: true,
          taskInstances: true,
          parentTasks: true,
          childTasks: true,
        },
      });
    }

    if (parentTaskId) {
      const hasValidHierarchy = await isTaskHierarchyValid(
        taskId,
        parentTaskId,
        user.id
      );

      if (!hasValidHierarchy) {
        throw new Error("Invalid task hierarchy");
      }

      await prisma.task.update({
        where: { id: parentTaskId, userId: user.id },
        data: {
          childTasks: {
            connect: { id: taskId },
          },
        },
      });

      task = await prisma.task.findUnique({
        where: { id: taskId, userId: user.id },
        include: {
          user: true,
          taskInstances: true,
          parentTasks: true,
          childTasks: true,
        },
      });
    }

    return task;
  },
  createBalanceTarget: async (
    _parent: unknown,
    args: {
      input: { timeWindow: string; taskId: number; targetAmount: number };
    },
    context: Context
  ) => {
    const { user } = context;

    if (!user) {
      throw new GraphQLError("User not authenticated", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: args.input.taskId, userId: user.id },
    });

    if (!task) {
      throw new GraphQLError("Task not found", {
        extensions: {
          code: "BAD_USER_INPUT",
          fieldName: "taskId",
        },
      });
    }

    const balanceTarget = await prisma.balanceTarget.create({
      data: {
        timeWindow: args.input.timeWindow as BalanceTarget["timeWindow"],
        taskId: args.input.taskId,
        targetAmount: args.input.targetAmount,
        userId: user.id,
      },
      include: { task: true },
    });

    return balanceTarget;
  },
  updateTaskSuggestionConfig: async (
    _parent: unknown,
    args: {
      input: {
        taskId: number;
        suggestionTimingType?: "RECURRING" | "DUE_DATE" | "SOON";
        recurringType?: "DAYS_SINCE_LAST_OCCURRENCE" | "SPECIFIC_DAYS";
        daysSinceLastOccurrence?: number;
        specificDays?: string;
        dueDate?: string;
        dueDateType?: "ON_DATE_ONLY" | "BEFORE_OR_ON";
      };
    },
    context: Context
  ) => {
    const { user } = context;

    if (!user) {
      throw new GraphQLError("User not authenticated", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: args.input.taskId, userId: user.id },
      include: {
        suggestionConfigs: true,
      },
    });

    if (!task) {
      throw new GraphQLError("Task not found", {
        extensions: {
          code: "BAD_USER_INPUT",
          fieldName: "taskId",
        },
      });
    }

    const existingConfig = task.suggestionConfigs[0];

    const { taskId, ...editedFields } = args.input;

    if (
      editedFields.specificDays &&
      !validSpecificDays.includes(editedFields.specificDays)
    ) {
      throw new GraphQLError("Invalid specificDays value", {
        extensions: {
          code: "BAD_USER_INPUT",
          fieldName: "specificDays",
        },
      });
    }

    if (existingConfig) {
      return await prisma.taskSuggestionConfig.update({
        where: { id: existingConfig.id, userId: user.id },
        data: editedFields,
      });
    } else {
      return await prisma.taskSuggestionConfig.create({
        data: {
          taskId: args.input.taskId,
          userId: user.id,
          ...editedFields,
        },
      });
    }
  },
};
