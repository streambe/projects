import type { FastifyPluginAsync } from 'fastify';
import { ReportsService } from './reports.service';
import { DateRangeQuerySchema } from './reports.schema';
import { AppError } from '../../shared/utils/errors';

const reportsRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/reports/new-clients?from=[ISO]&to=[ISO]
   * Returns new clients registered in the given period (RF-25).
   */
  fastify.get(
    '/new-clients',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = DateRangeQuerySchema.safeParse(request.query);
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
        const result = await ReportsService.newClients(parsed.data);
        return reply.code(200).send({ data: result });
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
   * GET /api/v1/reports/activities-by-user?from=[ISO]&to=[ISO]
   * Returns activity counts grouped by user (RF-26).
   */
  fastify.get(
    '/activities-by-user',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = DateRangeQuerySchema.safeParse(request.query);
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
        const result = await ReportsService.activitiesByUser(parsed.data);
        return reply.code(200).send({ data: result });
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

export default reportsRoutes;
