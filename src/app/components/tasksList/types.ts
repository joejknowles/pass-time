import { Task } from "../dayGrid/types";

export interface BasicTask {
    id: string;
    title: string;
    defaultDuration: number;
}


export interface BalanceTarget {
    id: string;
    timeWindow: string;
    targetAmount: number;
    progress: number;
    task: Task;
}

export interface TaskGroup {
    name: string;
    tasks: (BasicTask | Task)[];
    type: string;
    data?: BalanceTarget;
}

export interface DraggedTask {
    task: Task | BasicTask;
    position: { x: number, y: number };
    width: number;
}