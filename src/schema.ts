import {gql} from 'graphql-tag'; 


export const typeDefs = gql`
#dataTypes

    type User{
        id: ID!
        name: String!
        email: String!
        tasks: [Task!]!
        taskStatus: [TaskStatus!]!
    }


    type TaskStatus {
    id: ID!
    name: String!
    position: Int!
    isDefault: Boolean!
    users: [User!]!
    tasks: [Task!]!
    }

    type Task {
        id: ID!
        title: String!
        description: String
        status: TaskStatus!
        user: User!
        createdAt: String!
        updatedAt: String!
    }

    #Inputs for mutations

    input createTaskInput{
        title: String!
        description: String
        userId: String!
        statusId: String!
    }

    input updateTaskInput{
        id: ID!
        title: String!
        description: String
        statusId: String!
        userId: String!
    }

    input createTaskStatusInput{
        name: String!
        userId: String!
    }
    
    input updateTaskStatusInput{
        id: ID!
        name: String! 
        position: Int!
        userId: String!
    }
    
    type Query {
        getTasksByUserId(userId: String!): [Task!]!
        getTaskStatusesByUserId(userId: String!): [TaskStatus!]!
        getTaskById(id: String!): Task!
    }


    type Mutation {
        #Mutations for tasks
        createTask(input: createTaskInput!): Task!
        updateTask(input: updateTaskInput!): Task!
        deleteTaskById(id: String!): Boolean!

        #New colums 
        createTaskStatus(input: createTaskStatusInput!): TaskStatus!
        updateTaskStatus(input: updateTaskStatusInput!): TaskStatus!
        deleteTaskStatusById(id: String!, userId: String!): Boolean!
    }
`

