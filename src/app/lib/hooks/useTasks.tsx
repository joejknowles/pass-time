import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_TASKS, CREATE_TASK } from "@/app/lib/graphql/mutations";
import { Task } from "@/app/components/dayGrid/types";

interface TasksContextType {
    tasks: Task[] | undefined;
    refetchTasks: () => void;
    createTask: (title: string) => Promise<Task>;
    error: any;
    loading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: taskData, refetch: refetchTasks, error, loading } = useQuery<{ tasks: Task[] }>(GET_TASKS);
    const [createTaskMutation] = useMutation(CREATE_TASK);
    const tasks = taskData?.tasks;

    const createTask = async (title: string): Promise<Task> => {
        const { data } = await createTaskMutation({
            variables: {
                input: { title },
            },
        });
        return data.createTask;
    };

    return (
        <TasksContext.Provider value={{ tasks, refetchTasks, createTask, error, loading }}>
            {children}
        </TasksContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error("useTasks must be used within a TasksProvider");
    }
    return context;
};
