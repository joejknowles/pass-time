import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($email: String!, $firebaseId: String!) {
    createUser(email: $email, firebaseId: $firebaseId) {
      id
      firebaseId
      email
      createdAt
    }
  }
`;

export const CREATE_TASK_INSTANCE = gql`
  mutation CreateTaskInstance($input: CreateTaskInput!) {
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
        title
      }
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      title
      user {
        id
        email
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
