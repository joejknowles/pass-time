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
    defaultDuration: Int!
    isSuggestingEnabled: Boolean
    suggestionConfigs: [TaskSuggestionConfig!]!
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

  enum RecurringOrOnce {
    RECURRING
    ONE_OFF
  }

  enum RecurringType {
    DAYS_SINCE_LAST_OCCURRENCE
    SPECIFIC_DAYS
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

  type TaskSuggestionConfig {
    id: Int!
    taskId: Int!
    userId: Int!
    recurringOrOnce: RecurringOrOnce
    recurringType: RecurringType
    daysSinceLastOccurrence: Int
    specificDays: String
  }

  type Query {
    users: [User!]!
    tasks: [Task!]!
    taskInstances(input: GetTaskInstancesInput!): [TaskInstance!]!
    balanceTargets: [BalanceTarget!]!
    taskSuggestions: [TaskGroup!]!
    taskSuggestionConfig(taskId: Int!): TaskSuggestionConfig
  }

  input GetTaskInstancesInput {
    date: String!
  }

  input StartTimeInput {
    date: String!
    hour: Int!
    minute: Int!
  }

  input CreateTaskInstanceInput {
    title: String
    taskId: Int
    start: StartTimeInput!
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
    defaultDuration: Int
  }

  input UpdateTaskSuggestionConfigInput {
    taskId: Int!
    recurringOrOnce: RecurringOrOnce
    recurringType: RecurringType
    daysSinceLastOccurrence: Int
    specificDays: String
  }

  type Mutation {
    createUser(email: String!, firebaseId: String!, token: String!): User!
    createTaskInstance(input: CreateTaskInstanceInput!): TaskInstance!
    deleteTaskInstance(id: ID!): Boolean
    updateTaskInstance(input: UpdateTaskInstanceInput!): TaskInstance!
    updateTask(input: UpdateTaskInput!): Task!
    createBalanceTarget(input: CreateBalanceTargetInput!): BalanceTarget!
    updateTaskSuggestionConfig(input: UpdateTaskSuggestionConfigInput!): TaskSuggestionConfig!
  }
`;
