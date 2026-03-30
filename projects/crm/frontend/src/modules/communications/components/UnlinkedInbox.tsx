import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useUnlinkedMessages, useLinkMessage } from '../hooks/useCommunications';
import { useClientsList } from '../../clients/hooks/useClients';
import type { Message } from '../communications.types';

// ---------------------------------------------------------------------------
// Link modal
// ---------------------------------------------------------------------------

interface LinkModalProps {
  message: Message;
  onClose: () => void;
}

function LinkModal({ message, onClose }: LinkModalProps) {
  const [clientId, setClientId] = useState('');
  const { data: clientsData, isLoading } = useClientsList({ limit: 200 });
  const linkMessage = useLinkMessage();

  async function handleLink() {
    if (!clientId) {
      toast.error('Selecciona un cliente.');
      return;
    }
    try {
      await linkMessage.mutateAsync({ messageId: message.id, input: { clientId } });
      toast.success('Mensaje vinculado al cliente correctamente.');
      onClose();
    } catch {
      toast.error('No se pudo vincular el mensaje. Intenta nuevamente.');
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vincular mensaje a cliente"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Vincular a cliente</h2>
        <p className="text-sm text-gray-500 mb-5 line-clamp-2">
          Mensaje: <span className="font-medium text-gray-700">{message.body.slice(0, 80)}...</span>
        </p>

        <div className="mb-5">
          <label htmlFor="link-client" className="block text-xs font-medium text-gray-600 mb-1.5">
            Selecciona un cliente
          </label>
          <select
            id="link-client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Seleccionar cliente...</option>
            {clientsData?.data.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} -- {c.dni}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-surface-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleLink()}
            disabled={linkMessage.isPending || !clientId}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 shadow-sm transition-colors"
          >
            {linkMessage.isPending ? 'Vinculando...' : 'Vincular'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function UnlinkedInbox() {
  const { data, isLoading, isError } = useUnlinkedMessages();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const messages = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <span className="text-sm">Cargando mensajes sin vincular...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">
        <span className="text-sm">Error al cargar mensajes. Intenta nuevamente.</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-12">
        <span className="text-sm text-gray-400">No hay mensajes sin vincular en este momento.</span>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-surface-100 rounded-2xl border border-surface-200 bg-white shadow-card">
        {messages.map((msg) => (
          <div
            key={msg.id}
            data-testid="unlinked-message"
            className="flex items-start justify-between gap-4 p-4 hover:bg-surface-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              {/* Channel badge */}
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                    msg.channel === 'gmail'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-green-50 text-green-700'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      msg.channel === 'gmail' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                  {msg.channel === 'gmail' ? 'Gmail' : 'WhatsApp'}
                </span>
                <time className="text-xs text-gray-400" dateTime={msg.sentAt}>
                  {format(parseISO(msg.sentAt), "d MMM yyyy HH:mm", { locale: es })}
                </time>
              </div>

              {msg.subject && (
                <p className="text-sm font-medium text-gray-900 truncate">{msg.subject}</p>
              )}
              <p className="text-sm text-gray-600 line-clamp-2">{msg.body}</p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMessage(msg)}
              className="shrink-0 rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
            >
              Vincular a cliente
            </button>
          </div>
        ))}
      </div>

      {selectedMessage && (
        <LinkModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </>
  );
}
