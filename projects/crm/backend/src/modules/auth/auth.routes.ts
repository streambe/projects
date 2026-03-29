import type { FastifyPluginAsync } from 'fastify';
import { AuthService } from './auth.service';
import { LoginBodySchema, RegisterBodySchema, UpdateUserBodySchema } from './auth.schema';
import { AppError } from '../../shared/utils/errors';
import type { JwtPayload } from './auth.schema';

const REFRESH_COOKIE_NAME = 'refreshToken';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};

const authRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/auth/login
   * Returns an access token (body) and sets a refresh token (HttpOnly cookie).
   */
  fastify.post('/login', async (request, reply) => {
    const parsed = LoginBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: parsed.error.errors[0]?.message ?? 'Validation error',
      });
    }

    const { email, password } = parsed.data;

    try {
      const user = await AuthService.validateCredentials(email, password);
      const payload = AuthService.buildTokenPayload(user);

      const accessToken = fastify.jwt.sign(payload as object);
      const refreshToken = fastify.signRefresh(payload as object);

      reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

      return reply.code(200).send({
        accessToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      });
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          error: err.name,
          message: err.message,
        });
      }
      throw err;
    }
  });

  /**
   * POST /api/v1/auth/refresh
   * Exchanges a valid refresh token (cookie) for a new access token.
   */
  fastify.post(
    '/refresh',
    { preHandler: [fastify.authenticateRefresh] },
    async (request, reply) => {
      const decoded = request.refreshUser;

      const accessToken = fastify.jwt.sign({
        sub: decoded.sub,
        email: decoded.email,
        fullName: decoded.fullName,
      } as object);

      return reply.code(200).send({ accessToken });
    },
  );

  /**
   * POST /api/v1/auth/logout
   * Clears the refresh token cookie. Access tokens expire naturally (no blacklist in MVP).
   */
  fastify.post(
    '/logout',
    { preHandler: [fastify.authenticate] },
    async (_request, reply) => {
      reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
      return reply.code(200).send({ message: 'Logged out successfully' });
    },
  );

  /**
   * POST /api/v1/auth/register
   * Creates a new user account. Requires an authenticated user (admin only endpoint).
   */
  fastify.post('/register', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = RegisterBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: parsed.error.errors[0]?.message ?? 'Validation error',
      });
    }

    try {
      const user = await AuthService.createUser(parsed.data);
      return reply.code(201).send({ user });
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          error: err.name,
          message: err.message,
        });
      }
      throw err;
    }
  });

  /**
   * GET /api/v1/auth/me
   * Returns the currently authenticated user profile from the JWT payload.
   */
  fastify.get(
    '/me',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const payload = request.user as JwtPayload;
      return reply.code(200).send({
        user: {
          id: payload.sub,
          email: payload.email,
          fullName: payload.fullName,
        },
      });
    },
  );

  /**
   * GET /api/v1/auth/users
   * Returns all active users. Used to populate responsible-user selectors in the UI.
   */
  fastify.get(
    '/users',
    { preHandler: [fastify.authenticate] },
    async (_request, reply) => {
      try {
        const users = await AuthService.listUsers();
        return reply.code(200).send({ data: users });
      } catch (err) {
        if (err instanceof AppError) {
          return reply.code(err.statusCode).send({
            statusCode: err.statusCode,
            error: err.name,
            message: err.message,
          });
        }
        throw err;
      }
    },
  );

  /**
   * PUT /api/v1/users/:id  (RF-28)
   * Updates a user's editable fields. Requires authentication.
   */
  fastify.put(
    '/users/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const parsed = UpdateUserBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: parsed.error.errors[0]?.message ?? 'Validation error',
        });
      }

      try {
        const user = await AuthService.updateUser(id, parsed.data);
        return reply.code(200).send({ user });
      } catch (err) {
        if (err instanceof AppError) {
          return reply.code(err.statusCode).send({
            statusCode: err.statusCode,
            error: err.name,
            message: err.message,
          });
        }
        throw err;
      }
    },
  );

  /**
   * DELETE /api/v1/users/:id  (RF-28)
   * Soft-deletes (deactivates) a user. Requires authentication.
   */
  fastify.delete(
    '/users/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        await AuthService.deactivateUser(id);
        return reply.code(204).send();
      } catch (err) {
        if (err instanceof AppError) {
          return reply.code(err.statusCode).send({
            statusCode: err.statusCode,
            error: err.name,
            message: err.message,
          });
        }
        throw err;
      }
    },
  );
};

export default authRoutes;
