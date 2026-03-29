import type { FastifyPluginAsync } from 'fastify';
import { OpportunitiesService } from './opportunities.service';
import {
  CreateOpportunitySchema,
  UpdateOpportunitySchema,
  ChangeStageSchema,
  ListOpportunitiesQuerySchema,
} from './opportunities.schema';
import { AppError } from '../../shared/utils/errors';
import type { JwtPayload } from '../auth/auth.schema';

const opportunityRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/opportunities
   * Creates a new opportunity linked to a client.
   */
  fastify.post(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = CreateOpportunitySchema.safeParse(request.body);
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
        const opportunity = await OpportunitiesService.create(parsed.data);
        return reply.code(201).send({ data: opportunity });
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
   * GET /api/v1/opportunities
   * Lists all opportunities (kanban view) with optional stage/isOpen filters.
   */
  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = ListOpportunitiesQuerySchema.safeParse(request.query);
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
        const result = await OpportunitiesService.list(parsed.data);
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
   * PUT /api/v1/opportunities/:id/stage
   * Changes the stage of an opportunity. Records change in history.
   * Requires result when stage = cierre.
   */
  fastify.put(
    '/:id/stage',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = (request.user as JwtPayload).sub;

      const parsed = ChangeStageSchema.safeParse(request.body);
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
        const opportunity = await OpportunitiesService.changeStage(id, parsed.data, userId);
        return reply.code(200).send({ data: opportunity });
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
   * PUT /api/v1/opportunities/:id
   * Updates general opportunity fields (assignedUser, motoInterest).
   */
  fastify.put(
    '/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const parsed = UpdateOpportunitySchema.safeParse(request.body);
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
        const opportunity = await OpportunitiesService.update(id, parsed.data);
        return reply.code(200).send({ data: opportunity });
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
   * DELETE /api/v1/opportunities/:id
   * Deletes an opportunity and its history.
   */
  fastify.delete(
    '/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        await OpportunitiesService.delete(id);
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
// Nested route: GET /api/v1/clients/:clientId/opportunities
// Registered separately under the clients prefix
// ---------------------------------------------------------------------------

export const clientOpportunityRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/:clientId/opportunities',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { clientId } = request.params as { clientId: string };

      const parsed = ListOpportunitiesQuerySchema.safeParse(request.query);
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
        const result = await OpportunitiesService.listByClient(clientId, parsed.data);
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

export default opportunityRoutes;
