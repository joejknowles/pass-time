export interface Task {
  id: string;
  title: string;
  parentTasks: Task[];
  childTasks: Task[];
  defaultDuration: number;
  isSuggestingEnabled: boolean;
  taskInstances: BasicTaskInstance[];
}

export type DetailedTask = Task & {
  stats: {
    totals: {
      today: number;
      thisWeek: number;
      allTime: number;
    };
    data: {
      daily: {
        date: string;
        value: number;
      }[];
    };
  };
};

export interface ClientDateTime {
  date: string;
  hour: number;
  minute: number;
}

export interface BasicTaskInstance {
  id: string;
  start: ClientDateTime;
  duration: number;
}

export interface TaskInstance {
  id: string;
  task: Task;
  start: ClientDateTime;
  duration: number;
}

export interface DraftTaskInstance {
  title: string;
  start: ClientDateTime;
  duration: number;
  taskId?: string;
}

export type MoveType = "start" | "end" | "both";

export interface MovingTaskInfo {
  taskInstance: TaskInstance;
  moveType: MoveType;
  cursorMinutesFromStart?: number;
  hasChanged?: boolean;
  isSubmitting?: boolean;
  isSameAsInitial?: boolean;
}

export interface OpenDetailsPanelEntity {
  id: string;
  type: "Task" | "TaskInstance";
  tab?: number;
}
