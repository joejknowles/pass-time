import { NextRequest } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/app/lib/graphql/schema';
import { resolvers } from '@/app/lib/graphql/resolvers/resolvers';
import { Context } from '@/app/lib/graphql/resolvers/helpers/helpers';
import { admin } from '@/lib/firebaseAdmin';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest, Context>(server, {
  context: async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization') || '';
    console.log('context handler authHeader:', authHeader);
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      console.error('Authorization token is missing');
      throw new Error('Authorization token is missing');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('context handler decodedToken:', decodedToken);
      const user = await prisma.user.findUnique({
        where: { firebaseId: decodedToken.uid },
      });
      console.log('context handler user: ', user);
      if (!user) {
        console.error('User not found');
      }
      return { user };
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid or expired token');
    }
  },
});

export async function GET(req: NextRequest, _context: any) {
  return handler(req);
}

export async function POST(req: NextRequest, _context: any) {
  return handler(req);
}
