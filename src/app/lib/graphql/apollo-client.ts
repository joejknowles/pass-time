import { ApolloClient, InMemoryCache } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

if (process.env.NODE_ENV === 'development') {
    loadDevMessages();
    loadErrorMessages();
}

const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache(),
});

export default client;