import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import type { Message } from '../communications.types';

// ---------------------------------------------------------------------------
// Channel badge
// ---------------------------------------------------------------------------

function ChannelBadge({ channel }: { channel: Message['channel'] }) {
  if (channel === 'gmail') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        <span role="img" aria-hidden="true">📧</span>
        Gmail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
      <span role="img" aria-hidden="true">💬</span>
      WhatsApp
    </span>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MessageThreadProps {
  messages: Message[];
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MessageThread({ messages, isLoading }: MessageThreadProps) {
  // Sort chronologically (oldest first)
  const sorted = [...messages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <span className="text-sm">Cargando mensajes...</span>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
        <span className="text-3xl">💬</span>
        <span className="text-sm">No hay mensajes aún.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4" role="log" aria-label="Historial de mensajes">
      {sorted.map((msg) => {
        const isSent = msg.direction === 'outbound';
        return (
          <div
            key={msg.id}
            data-testid="message-bubble"
            className={cn('flex flex-col gap-1', isSent ? 'items-end' : 'items-start')}
          >
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
                isSent
                  ? 'rounded-tr-sm bg-blue-600 text-white'
                  : 'rounded-tl-sm bg-gray-100 text-gray-900',
              )}
            >
              {/* Subject (Gmail only) */}
              {msg.subject && (
                <p
                  className={cn(
                    'mb-1 text-xs font-semibold',
                    isSent ? 'text-blue-100' : 'text-gray-500',
                  )}
                >
                  Asunto: {msg.subject}
                </p>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.body}</p>
            </div>

            {/* Meta: time + channel badge */}
            <div className={cn('flex items-center gap-2', isSent ? 'flex-row-reverse' : 'flex-row')}>
              <ChannelBadge channel={msg.channel} />
              <time
                dateTime={msg.sentAt}
                className="text-xs text-gray-400"
              >
                {format(parseISO(msg.sentAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
              </time>
            </div>
          </div>
        );
      })}
    </div>
  );
}
