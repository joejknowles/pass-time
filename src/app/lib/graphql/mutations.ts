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

//$input: GetTaskInstacesInput!
//input: $input
export const GET_TASK_INSTANCES = gql`
  query GetTaskInstances {
    taskInstances {
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
