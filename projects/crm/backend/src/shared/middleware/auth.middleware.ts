import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Global authentication middleware.
 * Applied as a preHandler to all routes that require authentication.
 * Verifies the JWT access token from the Authorization: Bearer header.
 *
 * Usage in route:
 *   preHandler: [fastify.authenticate]
 *
 * Or use the `fastify.authenticate` decorator directly, which is equivalent.
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }
}
