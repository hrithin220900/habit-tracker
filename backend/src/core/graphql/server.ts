import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./schema.js";
import { analyticsResolvers } from "./resolvers/analytics.resolver.js";
import { createContext, type AuthContext } from "./context.js";
import { logger } from "../utils/logger.js";

export function createApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      Query: {
        ...analyticsResolvers.Query,
      },
    },
    introspection: true,
  });

  return server;
}

export async function startApolloServer(
  server: ApolloServer<AuthContext>,
  app: any
): Promise<void> {
  await server.start();
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: createContext,
    })
  );

  logger.info("GraphQL server started on /graphql");
}
