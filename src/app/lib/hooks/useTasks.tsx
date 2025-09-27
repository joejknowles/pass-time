import { createContext, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { CREATE_TASK, UPDATE_TASK } from "@/app/lib/graphql/mutations";
import { GET_TASKS } from "../graphql/queries";
import { Task } from "@/app/components/dayGrid/types";

interface TasksContextType {
  tasks: Task[] | undefined;
  refetchTasks: () => void;
  createTask: (title: string) => Promise<Task>;
  updateTask: (
    id: string,
    updates: Partial<Task> & { parentTaskId?: string; childTaskId?: string }
  ) => Promise<Task>;
  error: any;
  loading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: taskData,
    refetch: refetchTasks,
    error,
    loading,
  } = useQuery<{ tasks: Task[] }>(GET_TASKS);
  const [createTaskMutation] = useMutation(CREATE_TASK);
  const [updateTaskMutation] = useMutation(UPDATE_TASK);
  const tasks = taskData?.tasks;

  const createTask = async (title: string): Promise<Task> => {
    const { data } = await createTaskMutation({
      variables: {
        input: { title },
      },
    });
    refetchTasks();
    return data.createTask;
  };

  const updateTask = async (
    id: string,
    updates: Partial<Task>
  ): Promise<Task> => {
    const { data } = await updateTaskMutation({
      variables: {
        input: { id, ...updates },
      },
    });
    refetchTasks();
    return data.updateTask;
  };

  return (
    <TasksContext.Provider
      value={{ tasks, refetchTasks, createTask, updateTask, error, loading }}
    >
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
