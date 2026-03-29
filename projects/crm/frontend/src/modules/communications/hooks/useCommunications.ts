import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type {
  Message,
  MessagesListResponse,
  SendGmailInput,
  SendWhatsAppInput,
  LinkMessageInput,
  CommChannel,
} from '../communications.types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const commQueryKeys = {
  all: ['communications'] as const,
  byClient: (clientId: string) => ['communications', 'client', clientId] as const,
  byChannel: (channel: CommChannel) => ['communications', 'channel', channel] as const,
  unlinked: ['communications', 'unlinked'] as const,
};

// ---------------------------------------------------------------------------
// Messages by client (thread)
// ---------------------------------------------------------------------------

export function useClientMessages(clientId: string) {
  return useQuery({
    queryKey: commQueryKeys.byClient(clientId),
    queryFn: async () => {
      const { data } = await api.get<MessagesListResponse>('/communications', {
        params: { clientId, limit: 200 },
      });
      return data;
    },
    enabled: !!clientId,
  });
}

// ---------------------------------------------------------------------------
// Messages by channel
// ---------------------------------------------------------------------------

export function useChannelMessages(channel: CommChannel) {
  return useQuery({
    queryKey: commQueryKeys.byChannel(channel),
    queryFn: async () => {
      const { data } = await api.get<MessagesListResponse>('/communications', {
        params: { channel, limit: 200 },
      });
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Unlinked messages
// ---------------------------------------------------------------------------

export function useUnlinkedMessages() {
  return useQuery({
    queryKey: commQueryKeys.unlinked,
    queryFn: async () => {
      const { data } = await api.get<MessagesListResponse>('/communications/unlinked');
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Send Gmail
// ---------------------------------------------------------------------------

export function useSendGmail() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendGmailInput) => {
      const { data } = await api.post<{ data: Message }>('/communications/gmail/send', input);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: commQueryKeys.byClient(variables.clientId) });
      void qc.invalidateQueries({ queryKey: commQueryKeys.byChannel('gmail') });
    },
  });
}

// ---------------------------------------------------------------------------
// Send WhatsApp
// ---------------------------------------------------------------------------

export function useSendWhatsApp() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendWhatsAppInput) => {
      const { data } = await api.post<{ data: Message }>('/communications/whatsapp/send', input);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: commQueryKeys.byClient(variables.clientId) });
      void qc.invalidateQueries({ queryKey: commQueryKeys.byChannel('whatsapp') });
    },
  });
}

// ---------------------------------------------------------------------------
// Link message to client
// ---------------------------------------------------------------------------

export function useLinkMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, input }: { messageId: string; input: LinkMessageInput }) => {
      const { data } = await api.post<{ data: Message }>(
        `/communications/unlinked/${messageId}/link`,
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: commQueryKeys.unlinked });
      void qc.invalidateQueries({ queryKey: commQueryKeys.all });
    },
  });
}
