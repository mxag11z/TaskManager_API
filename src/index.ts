// src/index.ts - Servidor principal
import { ApolloServer } from 'apollo-server-express';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import { typeDefs } from './schema.ts';
import { resolvers } from './resolvers.ts';

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      prisma, 
    }),
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(`Server disponible en  http://localhost:4000${server.graphqlPath}`);
  });
}

startServer();