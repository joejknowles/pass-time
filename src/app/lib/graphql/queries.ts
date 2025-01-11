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
      recurringOrOnce
      recurringType
      daysSinceLastOccurrence
      specificDays
      oneOffDate
      oneOffDateType
    }
  }
`;
