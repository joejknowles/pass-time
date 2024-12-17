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
