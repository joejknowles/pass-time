export interface Task {
    id: number;
    title: string;
    userId: number;
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
}

export type MoveType = "start" | "end" | "both";
