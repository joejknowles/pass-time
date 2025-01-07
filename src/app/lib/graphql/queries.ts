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
