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

  input CreateTaskInput {
    title: String!
  }

  type Mutation {
    createUser(email: String!, firebaseId: String!): User!
    createTask(input: CreateTaskInput!): Task!
    createTaskInstance(userId: Int!, taskId: Int!, startTime: String!, duration: Int): TaskInstance!
  }
`;
