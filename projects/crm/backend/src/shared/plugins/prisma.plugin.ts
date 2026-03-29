import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyInstance } from 'fastify';
import { prisma } from '../../prisma/client';

/**
 * Prisma plugin — decorates the Fastify instance with `fastify.prisma`.
 * Handles graceful shutdown by disconnecting Prisma on server close.
 */
const prismaPlugin: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async () => {
    fastify.log.info('Disconnecting Prisma client...');
    await prisma.$disconnect();
  });
});

export default prismaPlugin;
