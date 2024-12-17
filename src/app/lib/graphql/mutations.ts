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

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      user {
        id
        email
      }
      taskInstances {
        id
      }
    }
  }
`;
