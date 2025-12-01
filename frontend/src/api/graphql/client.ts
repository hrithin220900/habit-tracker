import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { GraphQLError } from "graphql";
import { config } from "../../lib/config";

const httpLink = createHttpLink({
  uri: config.api.graphqlUrl,
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorLink = onError((errorResponse: any) => {
  const { graphQLErrors, networkError } = errorResponse as {
    graphQLErrors?: readonly GraphQLError[];
    networkError?: Error & { statusCode?: number };
  };

  if (graphQLErrors) {
    graphQLErrors.forEach((error: GraphQLError) => {
      console.error(
        `GraphQL error: Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`
      );
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);

    // Handle 401 - redirect to login
    if ("statusCode" in networkError && networkError.statusCode === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
    query: {
      fetchPolicy: "cache-first",
    },
  },
});
