import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    createdAt: String!
    tasks: [Task!]!
    taskInstances: [TaskInstance!]!
  }

  type Task {
    id: Int!
    title: String!
    user: User!
    taskInstances: [TaskInstance!]!
  }

  type TaskInstance {
    id: Int!
    user: User!
    task: Task!
    startTime: String!
    duration: Int!
  }

  type Query {
    users: [User!]!
    tasks: [Task!]!
    taskInstances: [TaskInstance!]!
  }

  type Mutation {
    createUser(email: String!): User!
    createTask(userId: Int!, title: String!): Task!
    createTaskInstance(userId: Int!, taskId: Int!, startTime: String!, duration: Int): TaskInstance!
  }
`;
