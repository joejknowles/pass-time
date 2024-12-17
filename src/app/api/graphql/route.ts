import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/app/lib/graphql/schema';
import { resolvers } from '@/app/lib/graphql/resolvers';
import { admin } from '@/lib/firebaseAdmin';
import { NextRequest } from 'next/server';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new Error('Authorization token is missing');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return { user: { uid: decodedToken.uid, email: decodedToken.email } };
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid or expired token');
    }
  },
});

export { handler as GET, handler as POST };
