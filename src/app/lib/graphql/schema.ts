import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: Int!
    firebaseId: String!
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
      id: ID!
      task: Task!
      user: User!
      start: Start!
      duration: Int!
  }

  type Start {
      date: String!
      hour: Int!
      minute: Int!
  }

  type Query {
    users: [User!]!
    tasks: [Task!]!
    taskInstances: [TaskInstance!]!
  }

  input StartInput {
    date: String!
    hour: Int!
    minute: Int!
  }

  input CreateTaskInput {
    title: String!
    start: StartInput!
    duration: Int!
  }

  type Mutation {
    createUser(email: String!, firebaseId: String!): User!
    createTaskInstance(input: CreateTaskInput!): TaskInstance!
  }
`;
