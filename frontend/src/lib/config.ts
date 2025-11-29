export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    graphqlUrl:
      process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql",
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
} as const;
