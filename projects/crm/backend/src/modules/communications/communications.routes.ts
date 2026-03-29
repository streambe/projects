import type { FastifyPluginAsync } from 'fastify';
import { CommunicationsService } from './communications.service';
import { SendEmailSchema, SendWhatsAppSchema, LinkMessageSchema } from './communications.schema';
import { AppError } from '../../shared/utils/errors';
import type { JwtPayload } from '../auth/auth.schema';

const communicationsRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/communications/accounts
   * Returns linked communication account configuration (RF-18).
   */
  fastify.get(
    '/accounts',
    { preHandler: [fastify.authenticate] },
    async (_request, reply) => {
      const accounts = CommunicationsService.getAccounts();
      return reply.code(200).send({ data: accounts });
    },
  );

  /**
   * POST /api/v1/communications/email
   * Sends an email to a client (RF-19).
   */
  fastify.post(
    '/email',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = SendEmailSchema.safeParse(request.body);
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
        const result = await CommunicationsService.sendEmail(parsed.data);
        return reply.code(201).send({ data: result });
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
   * GET /api/v1/communications/email/inbox
   * Returns incoming emails from the mock inbox (RF-20).
   */
  fastify.get(
    '/email/inbox',
    { preHandler: [fastify.authenticate] },
    async (_request, reply) => {
      try {
        const messages = await CommunicationsService.getEmailInbox();
        return reply.code(200).send({ data: messages });
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
   * POST /api/v1/communications/whatsapp
   * Sends a WhatsApp message to a client (RF-21).
   */
  fastify.post(
    '/whatsapp',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = SendWhatsAppSchema.safeParse(request.body);
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
        const result = await CommunicationsService.sendWhatsApp(parsed.data);
        return reply.code(201).send({ data: result });
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
   * GET /api/v1/communications/whatsapp/incoming
   * Returns incoming WhatsApp messages from the mock provider (RF-22).
   */
  fastify.get(
    '/whatsapp/incoming',
    { preHandler: [fastify.authenticate] },
    async (_request, reply) => {
      try {
        const messages = await CommunicationsService.getWhatsAppIncoming();
        return reply.code(200).send({ data: messages });
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
   * GET /api/v1/communications/unlinked
   * Returns messages not linked to any client (RF-24).
   */
  fastify.get(
    '/unlinked',
    { preHandler: [fastify.authenticate] },
    async (_request, reply) => {
      try {
        const messages = await CommunicationsService.getUnlinkedMessages();
        return reply.code(200).send({ data: messages });
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
   * POST /api/v1/communications/unlinked/:messageId/link
   * Links an unlinked message to a client (RF-24).
   */
  fastify.post(
    '/unlinked/:messageId/link',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { messageId } = request.params as { messageId: string };
      const parsed = LinkMessageSchema.safeParse(request.body);

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
        const assignedByUserId = (request.user as JwtPayload).sub;
        const message = await CommunicationsService.linkMessage(
          messageId,
          parsed.data.clientId,
          assignedByUserId,
        );
        return reply.code(200).send({ data: message });
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
// Nested route: GET /api/v1/clients/:clientId/messages (RF-23)
// Registered separately under the clients prefix
// ---------------------------------------------------------------------------

export const clientMessagesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/:clientId/messages',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { clientId } = request.params as { clientId: string };

      try {
        const messages = await CommunicationsService.getClientMessages(clientId);
        return reply.code(200).send({ data: messages });
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

export default communicationsRoutes;
