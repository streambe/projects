export const COMM_CHANNEL = {
  gmail: 'gmail',
  whatsapp: 'whatsapp',
} as const;

export type CommChannel = (typeof COMM_CHANNEL)[keyof typeof COMM_CHANNEL];

export const COMM_DIRECTION = {
  outbound: 'outbound',
  inbound: 'inbound',
} as const;

export type CommDirection = (typeof COMM_DIRECTION)[keyof typeof COMM_DIRECTION];

export interface Message {
  id: string;
  clientId?: string | null;
  channel: CommChannel;
  direction: CommDirection;
  subject?: string | null;
  body: string;
  sentAt: string;
  createdAt: string;
}

export interface SendGmailInput {
  clientId: string;
  subject?: string;
  body: string;
}

export interface SendWhatsAppInput {
  clientId: string;
  body: string;
}

export interface LinkMessageInput {
  clientId: string;
}

export interface MessagesListResponse {
  data: Message[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
