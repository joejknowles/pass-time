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
    progress: TaskProgress
  }

  type TaskProgress {
    today: Int!
    thisWeek: Int!
    allTime: Int!
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

  enum SuggestionTimingType {
    RECURRING
    DUE_DATE
    SOON
  }

  enum RecurringType {
    DAYS_SINCE_LAST_OCCURRENCE
    SPECIFIC_DAYS
  }

  enum DueDateType {
    ON_DATE_ONLY
    BEFORE_OR_ON
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
    data: BalanceTarget
  }

  type TaskSuggestionConfig {
    id: Int!
    taskId: Int!
    userId: Int!
    suggestionTimingType: SuggestionTimingType
    recurringType: RecurringType
    daysSinceLastOccurrence: Int
    specificDays: String
    dueDate: String
    dueDateType: DueDateType
  }

  type Query {
    users: [User!]!
    tasks: [Task!]!
    task(taskId: Int!): Task
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

  input CreateTaskInput {
    title: String!
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
    isSuggestingEnabled: Boolean
  }

  input UpdateTaskSuggestionConfigInput {
    taskId: Int!
    suggestionTimingType: SuggestionTimingType
    recurringType: RecurringType
    daysSinceLastOccurrence: Int
    specificDays: String
    dueDate: String
    dueDateType: DueDateType
  }

  type Mutation {
    createUser(email: String!, firebaseId: String!, token: String!): User!
    createTask(input: CreateTaskInput!): Task!
    createTaskInstance(input: CreateTaskInstanceInput!): TaskInstance!
    deleteTaskInstance(id: ID!): Boolean
    updateTaskInstance(input: UpdateTaskInstanceInput!): TaskInstance!
    updateTask(input: UpdateTaskInput!): Task!
    createBalanceTarget(input: CreateBalanceTargetInput!): BalanceTarget!
    updateTaskSuggestionConfig(input: UpdateTaskSuggestionConfigInput!): TaskSuggestionConfig!
  }
`;
