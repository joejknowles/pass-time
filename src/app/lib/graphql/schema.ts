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
    parentTasks: [Task!]!
    childTasks: [Task!]!
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

  enum TimeWindow {
    DAILY
    WEEKLY
  }

  type BalanceTarget {
    id: Int!
    timeWindow: TimeWindow!
    task: Task!
    targetAmount: Int!
    progress: Int!
  }

  type TaskGroup {
    name: String!
    tasks: [Task!]!
    type: String!
    data: BalanceTarget!
  }

  type Query {
    users: [User!]!
    tasks: [Task!]!
    taskInstances(input: GetTaskInstancesInput!): [TaskInstance!]!
    balanceTargets: [BalanceTarget!]!
    taskSuggestions: [TaskGroup!]!
  }

  input GetTaskInstancesInput {
    date: String!
  }

  input StartTimeInput {
    date: String!
    hour: Int!
    minute: Int!
  }

  input CreateTaskInput {
    title: String
    taskId: Int
    start: StartTimeInput!
    duration: Int!
  }

  input CreateBalanceTargetInput {
    timeWindow: TimeWindow!
    taskId: Int!
    targetAmount: Int!
  }

  input UpdateTaskInstanceInput {
    id: ID!
    title: String
    duration: Int
    start: StartTimeInput
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    parentTaskId: Int
  }

  type Mutation {
    createUser(email: String!, firebaseId: String!, token: String!): User!
    createTaskInstance(input: CreateTaskInput!): TaskInstance!
    deleteTaskInstance(id: ID!): Boolean
    updateTaskInstance(input: UpdateTaskInstanceInput!): TaskInstance!
    updateTask(input: UpdateTaskInput!): Task!
    createBalanceTarget(input: CreateBalanceTargetInput!): BalanceTarget!
  }
`;
