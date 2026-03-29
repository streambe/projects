import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface SentMessage {
  id: string;
  to: string;
  subject?: string;
  body: string;
  sentAt: string;
}

export interface IncomingMessage {
  id: string;
  from: string;
  subject?: string;
  body: string;
  receivedAt: string;
}

// ---------------------------------------------------------------------------
// Send email
// ---------------------------------------------------------------------------

export const SendEmailSchema = z.object({
  clientId: z.string().uuid('clientId must be a valid UUID'),
  subject: z.string().max(500).optional(),
  body: z.string().min(1, 'Body is required'),
});

export type SendEmailBody = z.infer<typeof SendEmailSchema>;

// ---------------------------------------------------------------------------
// Send WhatsApp
// ---------------------------------------------------------------------------

export const SendWhatsAppSchema = z.object({
  clientId: z.string().uuid('clientId must be a valid UUID'),
  message: z.string().min(1, 'Message is required'),
});

export type SendWhatsAppBody = z.infer<typeof SendWhatsAppSchema>;

// ---------------------------------------------------------------------------
// Link unlinked message to client
// ---------------------------------------------------------------------------

export const LinkMessageSchema = z.object({
  clientId: z.string().uuid('clientId must be a valid UUID'),
});

export type LinkMessageBody = z.infer<typeof LinkMessageSchema>;
