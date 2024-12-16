
import { ApolloProvider } from '@apollo/client';
import client from '@/app/lib/graphql/apollo-client';

export default function DataProvider({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={ client }>
            { children }
        </ApolloProvider>
    );
}
