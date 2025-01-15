import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($email: String!, $firebaseId: String!, $token: String!) {
    createUser(email: $email, firebaseId: $firebaseId, token: $token) {
      id
      firebaseId
      email
      createdAt
    }
  }
`;

export const CREATE_TASK_INSTANCE = gql`
  mutation CreateTaskInstance($input: CreateTaskInstanceInput!) {
    createTaskInstance(input: $input) {
      id
      duration
      start {
        date
        hour
        minute
      }
      user {
        id
        email
      }
      task {
        id,
        title
      }
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      defaultDuration
      isSuggestingEnabled
      user {
        id
        email
      }
      parentTasks {
        id
        title
      }
      childTasks {
        id
        title
      }
      taskInstances {
        id,
        start {
          date
          hour
          minute
        }
      }
    }
  }
`;

export const UPDATE_TASK_INSTANCE = gql`
  mutation UpdateTaskInstance($input: UpdateTaskInstanceInput!) {
    updateTaskInstance(input: $input) {
      id
      duration
      start {
        date
        hour
        minute
      }
      task {
        id
        title
      }
      user {
        id
        email
      }
    }
  }
`;

export const DELETE_TASK_INSTANCE = gql`
  mutation DeleteTaskInstance($id: ID!) {
    deleteTaskInstance(id: $id)
  }
`;

export const GET_TASK_INSTANCES = gql`
  query GetTaskInstances($input: GetTaskInstancesInput!) {
    taskInstances(input: $input) {
      id
      duration
      start {
        date
        hour
        minute
      }
      user {
        id
        email
      }
      task {
        id,
        title,
        parentTasks {
          id
          title
        }
        childTasks {
          id
          title
        }
      }
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      title
      defaultDuration
      isSuggestingEnabled
      user {
        id
        email
      }
      parentTasks {
        id
        title
      }
      childTasks {
        id
        title
      }
      taskInstances {
        id,
        start {
          date
          hour
          minute
        }
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      title
      parentTasks {
        id
        title
      }
      childTasks {
        id
        title
      }
      defaultDuration
      isSuggestingEnabled
    }
  }
`;

export const CREATE_BALANCE_TARGET = gql`
  mutation CreateBalanceTarget($input: CreateBalanceTargetInput!) {
    createBalanceTarget(input: $input) {
      id
      timeWindow
      targetAmount
      task {
        id
        title
      }
    }
  }
`;

export const UPDATE_TASK_SUGGESTION_CONFIG = gql`
  mutation UpdateTaskSuggestionConfig($input: UpdateTaskSuggestionConfigInput!) {
    updateTaskSuggestionConfig(input: $input) {
      id
      taskId
      userId
      recurringOrOnce
      recurringType
      daysSinceLastOccurrence
      specificDays
      oneOffDate
      oneOffDateType
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($input: DeleteTaskInput!) {
    deleteTask(input: $input)
  }
`;
