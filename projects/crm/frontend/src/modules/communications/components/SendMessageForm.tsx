import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { useSendGmail, useSendWhatsApp } from '../hooks/useCommunications';
import type { CommChannel } from '../communications.types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SendMessageFormProps {
  clientId: string;
  /** Whether this client has an email address (enables Gmail option) */
  hasEmail?: boolean;
  /** Whether this client has a WhatsApp number (enables WhatsApp option) */
  hasWhatsApp?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SendMessageForm({ clientId, hasEmail = true, hasWhatsApp = true }: SendMessageFormProps) {
  const [channel, setChannel] = useState<CommChannel>(hasEmail ? 'gmail' : 'whatsapp');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const sendGmail = useSendGmail();
  const sendWhatsApp = useSendWhatsApp();

  const isPending = sendGmail.isPending || sendWhatsApp.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!body.trim()) {
      toast.error('El mensaje no puede estar vacío.');
      return;
    }

    try {
      if (channel === 'gmail') {
        await sendGmail.mutateAsync({ clientId, subject: subject.trim() || undefined, body });
      } else {
        await sendWhatsApp.mutateAsync({ clientId, body });
      }

      toast.success('Mensaje enviado (simulado) correctamente.');
      setSubject('');
      setBody('');
    } catch {
      toast.error('No se pudo enviar el mensaje. Intentá nuevamente.');
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
      {/* Simulation warning badge */}
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <span role="img" aria-hidden="true" className="text-base">⚠️</span>
        <p className="text-xs font-medium text-amber-800">
          Modo simulación — los mensajes no se envían realmente
        </p>
      </div>

      {/* Channel selector */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-600">Canal</p>
        <div className="flex gap-2">
          {hasEmail && (
            <button
              type="button"
              onClick={() => setChannel('gmail')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                channel === 'gmail'
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              <span role="img" aria-hidden="true">📧</span>
              Gmail
            </button>
          )}
          {hasWhatsApp && (
            <button
              type="button"
              onClick={() => setChannel('whatsapp')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                channel === 'whatsapp'
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              <span role="img" aria-hidden="true">💬</span>
              WhatsApp
            </button>
          )}
        </div>
      </div>

      {/* Subject (Gmail only) */}
      {channel === 'gmail' && (
        <div>
          <label htmlFor="msg-subject" className="block text-xs font-medium text-gray-600 mb-1">
            Asunto
          </label>
          <input
            id="msg-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Asunto del correo"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Body */}
      <div>
        <label htmlFor="msg-body" className="block text-xs font-medium text-gray-600 mb-1">
          Mensaje <span className="text-red-500">*</span>
        </label>
        <textarea
          id="msg-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={channel === 'gmail' ? 'Escribí tu correo aquí...' : 'Escribí tu mensaje de WhatsApp...'}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Enviando...' : `Enviar por ${channel === 'gmail' ? 'Gmail' : 'WhatsApp'}`}
        </button>
      </div>
    </form>
  );
}
