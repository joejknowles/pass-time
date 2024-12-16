import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($email: String!) {
    createUser(email: $email) {
      id
      email
      createdAt
    }
  }
`;
