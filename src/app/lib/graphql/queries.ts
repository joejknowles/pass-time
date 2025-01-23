import { gql } from '@apollo/client';

export const GET_BALANCE_TARGETS = gql`
  query GetBalanceTargets {
    balanceTargets {
      id
      timeWindow
      targetAmount
      progress
      task {
        id
        title
      }
    }
  }
`;

export const GET_TASK_SUGGESTIONS = gql`
  query GetTaskSuggestions {
    taskSuggestions {
      name
      tasks {
        id
        title
        defaultDuration
      }
      type
      data {
        id
        timeWindow
        targetAmount
        progress
        task {
          id
          title
          defaultDuration
        }
      }
    }
  }
`;

export const GET_TASK_SUGGESTION_CONFIG = gql`
  query GetTaskSuggestionConfig($taskId: Int!) {
    taskSuggestionConfig(taskId: $taskId) {
      id
      taskId
      userId
      suggestionTimingType
      recurringType
      daysSinceLastOccurrence
      specificDays
      dueDate
      dueDateType
    }
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
        defaultDuration,
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
        },
        duration
      }
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($taskId: Int!) {
    task(taskId: $taskId) {
      id
      progress {
        today
        thisWeek
        allTime
      }
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
        },
        duration
      }
    }
  }
`;