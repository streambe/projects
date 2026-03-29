import type { SentMessage, IncomingMessage } from '../communications.schema';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface WhatsAppProvider {
  sendMessage(to: string, body: string): Promise<SentMessage>;
  getIncoming(): Promise<IncomingMessage[]>;
}

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(to: string, body: string): Promise<SentMessage> {
    console.log(`MOCK: would send to ${to}`);

    return {
      id: `mock-whatsapp-${Date.now()}`,
      to,
      body,
      sentAt: new Date().toISOString(),
    };
  }

  async getIncoming(): Promise<IncomingMessage[]> {
    return [
      {
        id: 'mock-wa-001',
        from: '+5493511234567',
        body: 'Hola! Me interesa saber el precio de la CG 150.',
        receivedAt: new Date(Date.now() - 1800_000).toISOString(),
      },
      {
        id: 'mock-wa-002',
        from: '+5493519876543',
        body: 'Buen día, ¿tienen financiación disponible?',
        receivedAt: new Date(Date.now() - 5400_000).toISOString(),
      },
      {
        id: 'mock-wa-003',
        from: '+5493500000001',
        body: '¿Están abiertos el sábado?',
        receivedAt: new Date(Date.now() - 9000_000).toISOString(),
      },
    ];
  }
}
