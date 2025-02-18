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
    progress: {
        today: number;
        thisWeek: number;
        allTime: number;
    }
}

export interface BasicTaskInstance {
    id: string;
    start: {
        date: string;
        hour: number;
        minute: number;
    };
    duration: number;
}

export interface TaskInstance {
    id: string;
    task: Task;
    start: {
        date: string;
        hour: number;
        minute: number;
    };
    duration: number;
}

export interface DraftTaskInstance {
    title: string;
    start: {
        date: string;
        hour: number;
        minute: number;
    };
    duration: number;
    taskId?: string;
}

export type MoveType = "start" | "end" | "both";

export interface MovingTaskInfo {
    taskInstance: TaskInstance,
    moveType: MoveType,
    cursorMinutesFromStart?: number,
    hasChanged?: boolean,
    isSubmitting?: boolean,
    isSameAsInitial?: boolean,
}

export interface OpenDetailsPanelEntity {
    id: string;
    type: "Task" | "TaskInstance";
    tab?: number;
}
