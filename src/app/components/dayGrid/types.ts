export interface Task {
    id: string;
    title: string;
    parentTasks: Task[];
    childTasks: Task[];
    defaultDuration: number;
    isSuggestingEnabled: boolean;
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
}
