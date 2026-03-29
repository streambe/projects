import type { FastifyPluginAsync } from 'fastify';
import { ActivitiesService } from './activities.service';
import {
  CreateActivitySchema,
  UpdateActivitySchema,
  CompleteActivitySchema,
  ListActivitiesQuerySchema,
} from './activities.schema';
import { AppError } from '../../shared/utils/errors';
import type { JwtPayload } from '../auth/auth.schema';

const activityRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/activities
   * Creates a new activity.
   */
  fastify.post(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = CreateActivitySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0]?.message ?? 'Validation error',
            details: parsed.error.errors,
          },
        });
      }

      try {
        const requestingUserId = (request.user as JwtPayload).sub;
        const activity = await ActivitiesService.create(parsed.data, requestingUserId);
        return reply.code(201).send({ data: activity });
      } catch (err) {
        if (err instanceof AppError) {
          return reply.code(err.statusCode).send({
            error: { code: err.name.toUpperCase(), message: err.message },
          });
        }
        throw err;
      }
    },
  );

  /**
   * GET /api/v1/activities
   * Lists activities with optional filters (status, type, assignedTo, dateFrom, dateTo).
   */
  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = ListActivitiesQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0]?.message ?? 'Validation error',
            details: parsed.error.errors,
          },
        });
      }

      try {
        const result = await ActivitiesService.list(parsed.data);
        return reply.code(200).send(result);
      } catch (err) {
        if (err instanceof AppError) {
          return reply.code(err.statusCode).send({
            error: { code: err.name.toUpperCase(), message: err.message },
          });
        }
        throw err;
      }
    },
  );

  /**
   * PUT /api/v1/activities/:id
   * Updates an existing activity.
   */
  fastify.put(
    '/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const parsed = UpdateActivitySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0]?.message ?? 'Validation error',
            details: parsed.error.errors,
          },
        });
      }

      try {
        const activity = await ActivitiesService.update(id, parsed.data);
        return reply.code(200).send({ data: activity });
      } catch (err) {
        if (err instanceof AppError) {
          return reply.code(err.statusCode).send({
            error: { code: err.name.toUpperCase(), message: err.message },
          });
        }
        throw err;
      }
    },
  );

  /**
   * PUT /api/v1/activities/:id/complete
   * Marks an activity as realizada with optional summary notes.
   */
  fastify.put(
    '/:id/complete',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const parsed = CompleteActivitySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0]?.message ?? 'Validation error',
            details: parsed.error.errors,
          },
        });
      }

      try {
        const activity = await ActivitiesService.complete(id, parsed.data);
        return reply.code(200).send({ data: activity });
      } catch (err) {
        if (err instanceof AppError) {
          return reply.code(err.statusCode).send({
            error: { code: err.name.toUpperCase(), message: err.message },
          });
        }
        throw err;
      }
    },
  );

  /**
   * DELETE /api/v1/activities/:id
   * Deletes an activity.
   */
  fastify.delete(
    '/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        await ActivitiesService.delete(id);
        return reply.code(204).send();
      } catch (err) {
        if (err instanceof AppError) {
          return reply.code(err.statusCode).send({
            error: { code: err.name.toUpperCase(), message: err.message },
          });
        }
        throw err;
      }
    },
  );
};

// ---------------------------------------------------------------------------
// Nested route: GET /api/v1/clients/:clientId/activities
// Registered separately under the clients prefix
// ---------------------------------------------------------------------------

export const clientActivityRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/:clientId/activities',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { clientId } = request.params as { clientId: string };

      const parsed = ListActivitiesQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0]?.message ?? 'Validation error',
            details: parsed.error.errors,
          },
        });
      }

      try {
        const result = await ActivitiesService.listByClient(clientId, parsed.data);
        return reply.code(200).send(result);
      } catch (err) {
        if (err instanceof AppError) {
          return reply.code(err.statusCode).send({
            error: { code: err.name.toUpperCase(), message: err.message },
          });
        }
        throw err;
      }
    },
  );
};

export default activityRoutes;
