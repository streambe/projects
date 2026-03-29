import type { SentMessage, IncomingMessage } from '../communications.schema';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface GmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<SentMessage>;
  getInbox(): Promise<IncomingMessage[]>;
}

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

export class MockGmailProvider implements GmailProvider {
  async sendEmail(to: string, subject: string, body: string): Promise<SentMessage> {
    console.log(`MOCK: would send to ${to}`);

    return {
      id: `mock-gmail-${Date.now()}`,
      to,
      subject,
      body,
      sentAt: new Date().toISOString(),
    };
  }

  async getInbox(): Promise<IncomingMessage[]> {
    return [
      {
        id: 'mock-inbox-001',
        from: 'cliente1@example.com',
        subject: 'Consulta sobre moto Honda CB125F',
        body: 'Buenos días, quisiera saber si tienen disponible la Honda CB125F en color rojo.',
        receivedAt: new Date(Date.now() - 3600_000).toISOString(),
      },
      {
        id: 'mock-inbox-002',
        from: 'cliente2@example.com',
        subject: 'Seguimiento cotización',
        body: 'Hola, escribo para hacer seguimiento de la cotización que solicité la semana pasada.',
        receivedAt: new Date(Date.now() - 7200_000).toISOString(),
      },
      {
        id: 'mock-inbox-003',
        from: 'desconocido@example.com',
        subject: 'Precio Yamaha FZ25',
        body: '¿Cuál es el precio actual de la Yamaha FZ25?',
        receivedAt: new Date(Date.now() - 10800_000).toISOString(),
      },
    ];
  }
}
