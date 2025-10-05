import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', 
  credentials: 'include', 
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Product: {
        fields: {
          id: {
            read(id) {
              return id;
            }
          }
        }
      }
    }
  }),
  connectToDevTools: import.meta.env.DEV,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;