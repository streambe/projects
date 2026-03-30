import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import type { Message } from '../communications.types';

// ---------------------------------------------------------------------------
// Channel badge
// ---------------------------------------------------------------------------

function ChannelBadge({ channel }: { channel: Message['channel'] }) {
  const isGmail = channel === 'gmail';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        isGmail ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isGmail ? 'bg-red-500' : 'bg-green-500',
        )}
      />
      {isGmail ? 'Gmail' : 'WhatsApp'}
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
      <div className="flex flex-col items-center justify-center gap-1 py-12">
        <span className="text-sm text-gray-400">No hay mensajes aun.</span>
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
                'max-w-[75%] rounded-2xl px-4 py-3',
                isSent
                  ? 'rounded-tr-sm bg-brand-500 text-white shadow-sm'
                  : 'rounded-tl-sm bg-surface-100 text-gray-900',
              )}
            >
              {/* Subject (Gmail only) */}
              {msg.subject && (
                <p
                  className={cn(
                    'mb-1 text-xs font-semibold',
                    isSent ? 'text-white/70' : 'text-gray-500',
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
