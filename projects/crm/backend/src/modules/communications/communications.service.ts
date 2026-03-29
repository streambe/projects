import { prisma } from '../../prisma/client';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';
import { MockGmailProvider } from './providers/gmail.provider';
import { MockWhatsAppProvider } from './providers/whatsapp.provider';
import type { SendEmailBody, SendWhatsAppBody } from './communications.schema';

// ---------------------------------------------------------------------------
// Provider singletons
// ---------------------------------------------------------------------------

const gmailProvider = new MockGmailProvider();
const whatsappProvider = new MockWhatsAppProvider();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Attempts to find a client by email address.
 * Returns the client id if found, null otherwise.
 */
async function findClientByEmail(email: string): Promise<string | null> {
  const client = await prisma.client.findFirst({
    where: { email, isActive: true },
    select: { id: true },
  });
  return client?.id ?? null;
}

/**
 * Attempts to find a client by WhatsApp number.
 * Returns the client id if found, null otherwise.
 */
async function findClientByPhone(phone: string): Promise<string | null> {
  const client = await prisma.client.findFirst({
    where: { whatsappNumber: phone, isActive: true },
    select: { id: true },
  });
  return client?.id ?? null;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const CommunicationsService = {
  /**
   * Returns mock configuration for linked communication accounts (RF-18).
   */
  getAccounts() {
    return {
      gmail: {
        connected: true,
        address: 'ciudadmoto@gmail.com',
        lastSync: new Date(Date.now() - 300_000).toISOString(),
      },
      whatsapp: {
        connected: true,
        phoneNumber: '+5493511112222',
        businessName: 'Ciudad Moto',
        lastSync: new Date(Date.now() - 60_000).toISOString(),
      },
    };
  },

  /**
   * Sends an email to the client and persists the outbound message (RF-19).
   */
  async sendEmail(body: SendEmailBody) {
    const client = await prisma.client.findUnique({
      where: { id: body.clientId },
      select: { id: true, email: true, isActive: true },
    });

    if (!client || !client.isActive) {
      throw new NotFoundError('Cliente no encontrado o inactivo');
    }
    if (!client.email) {
      throw new ValidationError('El cliente no tiene un email registrado');
    }

    const sent = await gmailProvider.sendEmail(client.email, body.subject, body.body);

    const message = await prisma.message.create({
      data: {
        channel: 'gmail',
        direction: 'outbound',
        clientId: body.clientId,
        externalId: sent.id,
        fromAddress: 'ciudadmoto@gmail.com',
        toAddress: client.email,
        subject: body.subject,
        body: body.body,
        sentReceivedAt: new Date(sent.sentAt),
      },
    });

    return { sent, messageId: message.id };
  },

  /**
   * Retrieves mock inbox messages and creates inbound records for any
   * message not yet persisted (RF-20). Auto-links if from_address matches a client.
   */
  async getEmailInbox() {
    const incoming = await gmailProvider.getInbox();

    const results = await Promise.all(
      incoming.map(async (msg) => {
        const autoClientId = await findClientByEmail(msg.from);

        await prisma.message.upsert({
          where: { channel_externalId: { channel: 'gmail', externalId: msg.id } },
          create: {
            channel: 'gmail',
            direction: 'inbound',
            clientId: autoClientId,
            externalId: msg.id,
            fromAddress: msg.from,
            toAddress: 'ciudadmoto@gmail.com',
            subject: msg.subject,
            body: msg.body,
            sentReceivedAt: new Date(msg.receivedAt),
          },
          update: {},
        });

        return {
          ...msg,
          linkedClientId: autoClientId,
        };
      }),
    );

    return results;
  },

  /**
   * Sends a WhatsApp message to the client and persists it (RF-21).
   */
  async sendWhatsApp(body: SendWhatsAppBody) {
    const client = await prisma.client.findUnique({
      where: { id: body.clientId },
      select: { id: true, whatsappNumber: true, isActive: true },
    });

    if (!client || !client.isActive) {
      throw new NotFoundError('Cliente no encontrado o inactivo');
    }
    if (!client.whatsappNumber) {
      throw new ValidationError('El cliente no tiene un número de WhatsApp registrado');
    }

    const sent = await whatsappProvider.sendMessage(client.whatsappNumber, body.message);

    const message = await prisma.message.create({
      data: {
        channel: 'whatsapp',
        direction: 'outbound',
        clientId: body.clientId,
        externalId: sent.id,
        fromAddress: '+5493511112222',
        toAddress: client.whatsappNumber,
        body: body.message,
        sentReceivedAt: new Date(sent.sentAt),
      },
    });

    return { sent, messageId: message.id };
  },

  /**
   * Retrieves mock incoming WhatsApp messages and creates inbound records (RF-22).
   * Auto-links if from_number matches a client.
   */
  async getWhatsAppIncoming() {
    const incoming = await whatsappProvider.getIncoming();

    const results = await Promise.all(
      incoming.map(async (msg) => {
        const autoClientId = await findClientByPhone(msg.from);

        await prisma.message.upsert({
          where: { channel_externalId: { channel: 'whatsapp', externalId: msg.id } },
          create: {
            channel: 'whatsapp',
            direction: 'inbound',
            clientId: autoClientId,
            externalId: msg.id,
            fromAddress: msg.from,
            toAddress: '+5493511112222',
            body: msg.body,
            sentReceivedAt: new Date(msg.receivedAt),
          },
          update: {},
        });

        return {
          ...msg,
          linkedClientId: autoClientId,
        };
      }),
    );

    return results;
  },

  /**
   * Returns the unified message history for a client (RF-23).
   */
  async getClientMessages(clientId: string) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) throw new NotFoundError('Client', clientId);

    const messages = await prisma.message.findMany({
      where: { clientId },
      orderBy: { sentReceivedAt: 'desc' },
    });

    return messages;
  },

  /**
   * Returns messages that have not been linked to any client (RF-24).
   */
  async getUnlinkedMessages() {
    const messages = await prisma.message.findMany({
      where: { clientId: null },
      orderBy: { sentReceivedAt: 'desc' },
    });

    return messages;
  },

  /**
   * Links an unlinked message to a client (RF-24).
   */
  async linkMessage(messageId: string, clientId: string, assignedByUserId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, clientId: true },
    });
    if (!message) throw new NotFoundError('Message', messageId);

    if (message.clientId !== null) {
      throw new ValidationError('El mensaje ya está vinculado a un cliente');
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, isActive: true },
    });
    if (!client || !client.isActive) {
      throw new NotFoundError('Cliente no encontrado o inactivo');
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        clientId,
        assignedByUserId,
      },
    });

    return updated;
  },
};
