import type { PrismaClient } from '@prisma/client';
import type { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateRefresh: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    signRefresh: (payload: object) => string;
  }

  interface FastifyRequest {
    refreshUser: {
      sub: string;
      email: string;
      fullName: string;
    };
  }
}
