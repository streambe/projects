import type { FastifyPluginAsync } from 'fastify';
import { ClientsService } from './clients.service';
import {
  CreateClientSchema,
  UpdateClientSchema,
  ListClientsQuerySchema,
} from './clients.schema';
import { AppError } from '../../shared/utils/errors';

const clientRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/clients
   * Creates a new client. Returns 409 with conflict info on duplicate DNI/phone.
   */
  fastify.post(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = CreateClientSchema.safeParse(request.body);
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
        const { client, conflict } = await ClientsService.create(parsed.data);

        if (conflict) {
          return reply.code(409).send({
            error: {
              code: 'DUPLICATE_CLIENT',
              message: `A client with the same ${conflict.field === 'dni' ? 'DNI' : 'phone number'} already exists`,
            },
            conflict: {
              id: conflict.id,
              fullName: conflict.fullName,
            },
          });
        }

        return reply.code(201).send({ data: client });
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
   * GET /api/v1/clients
   * Lists clients with pagination, optional search, and isActive filter.
   */
  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = ListClientsQuerySchema.safeParse(request.query);
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
        const result = await ClientsService.list(parsed.data);
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
   * GET /api/v1/clients/:id
   * Returns a client with recent opportunities and activities.
   */
  fastify.get(
    '/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const client = await ClientsService.findById(id);
        return reply.code(200).send({ data: client });
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
   * PUT /api/v1/clients/:id
   * Updates a client. Re-validates duplicates if DNI or phone changes.
   */
  fastify.put(
    '/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const parsed = UpdateClientSchema.safeParse(request.body);
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
        const { client, conflict } = await ClientsService.update(id, parsed.data);

        if (conflict) {
          return reply.code(409).send({
            error: {
              code: 'DUPLICATE_CLIENT',
              message: `A client with the same ${conflict.field === 'dni' ? 'DNI' : 'phone number'} already exists`,
            },
            conflict: {
              id: conflict.id,
              fullName: conflict.fullName,
            },
          });
        }

        return reply.code(200).send({ data: client });
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
   * DELETE /api/v1/clients/:id
   * Soft-deletes a client (sets isActive = false).
   */
  fastify.delete(
    '/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        await ClientsService.softDelete(id);
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

export default clientRoutes;
