import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import prismaPlugin from './shared/plugins/prisma.plugin';
import jwtPlugin from './shared/plugins/jwt.plugin';
import authRoutes from './modules/auth/auth.routes';
import clientRoutes from './modules/clients/clients.routes';
import opportunityRoutes, { clientOpportunityRoutes } from './modules/opportunities/opportunities.routes';
import activityRoutes, { clientActivityRoutes } from './modules/activities/activities.routes';
import communicationsRoutes, { clientMessagesRoutes } from './modules/communications/communications.routes';
import reportsRoutes from './modules/reports/reports.routes';
import { AppError } from './shared/utils/errors';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
      ...(process.env['NODE_ENV'] === 'development'
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                colorize: true,
              },
            },
          }
        : {}),
    },
    trustProxy: true,
  });

  // -------------------------------------------------------------------------
  // Security plugins
  // -------------------------------------------------------------------------
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: process.env['NODE_ENV'] === 'production',
  });

  await app.register(fastifyCors, {
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    }),
  });

  // -------------------------------------------------------------------------
  // Cookie support (required for HttpOnly refresh token)
  // -------------------------------------------------------------------------
  await app.register(fastifyCookie);

  // -------------------------------------------------------------------------
  // Application plugins
  // -------------------------------------------------------------------------
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);

  // -------------------------------------------------------------------------
  // OpenAPI / Swagger (development only)
  // -------------------------------------------------------------------------
  if (process.env['NODE_ENV'] !== 'production') {
    await app.register(fastifySwagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'CRM Ciudad Moto API',
          description: 'Backend API for CRM Ciudad Moto',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${process.env['PORT'] ?? 3000}/api/v1`,
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    });

    await app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });
  }

  // -------------------------------------------------------------------------
  // Health check (no auth required)
  // -------------------------------------------------------------------------
  app.get('/health', async (_request, reply) => {
    return reply.code(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env['NODE_ENV'] ?? 'development',
    });
  });

  // -------------------------------------------------------------------------
  // API v1 routes
  // -------------------------------------------------------------------------
  await app.register(
    async (v1) => {
      await v1.register(authRoutes, { prefix: '/auth' });
      await v1.register(clientRoutes, { prefix: '/clients' });
      await v1.register(opportunityRoutes, { prefix: '/opportunities' });
      await v1.register(activityRoutes, { prefix: '/activities' });

      await v1.register(communicationsRoutes, { prefix: '/communications' });
      await v1.register(reportsRoutes, { prefix: '/reports' });

      // Nested client routes: /clients/:clientId/opportunities, /clients/:clientId/activities
      // and /clients/:clientId/messages
      await v1.register(clientOpportunityRoutes, { prefix: '/clients' });
      await v1.register(clientActivityRoutes, { prefix: '/clients' });
      await v1.register(clientMessagesRoutes, { prefix: '/clients' });
    },
    { prefix: '/api/v1' },
  );

  // -------------------------------------------------------------------------
  // Global error handler
  // -------------------------------------------------------------------------
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    // Handle our operational errors
    if (error instanceof AppError && error.isOperational) {
      return reply.code(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      });
    }

    // Fastify validation errors (schema validation)
    if (error.validation) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message,
      });
    }

    // Rate limit errors
    if (error.statusCode === 429) {
      return reply.code(429).send({
        statusCode: 429,
        error: 'Too Many Requests',
        message: error.message,
      });
    }

    // Unknown / unexpected errors — do not leak internals
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message:
        process.env['NODE_ENV'] === 'production'
          ? 'An unexpected error occurred'
          : error.message,
    });
  });

  // 404 handler
  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Route not found',
    });
  });

  return app;
}
