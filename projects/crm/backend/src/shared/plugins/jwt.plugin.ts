import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import jwt from 'jsonwebtoken';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

/**
 * JWT plugin — registers @fastify/jwt for access token verification (Bearer header).
 * Refresh tokens use a separate secret via jsonwebtoken directly to avoid
 * sharing the same signing secret as access tokens.
 *
 * Decorates the Fastify instance with:
 *   - fastify.authenticate        — verifies access token from Authorization header
 *   - fastify.authenticateRefresh — verifies refresh token from HttpOnly cookie
 *   - fastify.signRefresh         — signs a new refresh token
 */
const jwtPlugin: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  const jwtSecret = process.env['JWT_SECRET'];
  const refreshSecret = process.env['JWT_REFRESH_SECRET'];
  const jwtExpiresIn = process.env['JWT_EXPIRES_IN'] ?? '1h';
  const refreshExpiresIn = process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d';

  if (!jwtSecret || !refreshSecret) {
    throw new Error(
      'JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables',
    );
  }

  // Register @fastify/jwt for access token handling
  await fastify.register(fastifyJwt, {
    secret: jwtSecret,
    sign: { expiresIn: jwtExpiresIn },
  });

  /**
   * Decorator: authenticate
   * Verifies the access token from the Authorization: Bearer header.
   */
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await request.jwtVerify();
      } catch {
        reply.code(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid or expired access token',
        });
      }
    },
  );

  /**
   * Decorator: authenticateRefresh
   * Verifies the refresh token from the HttpOnly cookie using the refresh secret.
   * Attaches the decoded payload to request.refreshUser.
   */
  fastify.decorate(
    'authenticateRefresh',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        const cookies = request.cookies as Record<string, string | undefined>;
        const cookieValue = cookies['refreshToken'];
        if (!cookieValue) {
          throw new Error('Missing refresh token cookie');
        }
        const decoded = jwt.verify(cookieValue, refreshSecret) as {
          sub: string;
          email: string;
          fullName: string;
        };
        request.refreshUser = decoded;
      } catch {
        reply.code(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid or expired refresh token',
        });
      }
    },
  );

  /**
   * Decorator: signRefresh
   * Signs a new refresh token using the refresh secret.
   * Called from auth routes after successful login.
   */
  fastify.decorate('signRefresh', (payload: object): string => {
    return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn } as jwt.SignOptions);
  });
});

export default jwtPlugin;
