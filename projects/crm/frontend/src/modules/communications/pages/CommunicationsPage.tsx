import { useState } from 'react';
import { MessageThread } from '../components/MessageThread';
import { SendMessageForm } from '../components/SendMessageForm';
import { UnlinkedInbox } from '../components/UnlinkedInbox';
import { useChannelMessages } from '../hooks/useCommunications';
import type { CommChannel } from '../communications.types';
import { cn } from '../../../lib/utils';

// ---------------------------------------------------------------------------
// Channel tab panel
// ---------------------------------------------------------------------------

function ChannelTab({
  channel,
  label,
  icon,
}: {
  channel: CommChannel;
  label: string;
  icon: string;
}) {
  const { data, isLoading } = useChannelMessages(channel);
  const messages = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Thread */}
      <div className="flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">
            <span role="img" aria-hidden="true" className="mr-1">{icon}</span>
            Historial — {label}
          </h2>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <MessageThread messages={messages} isLoading={isLoading} />
        </div>
      </div>

      {/* Send form — no clientId on global page, show informational message */}
      <div className="w-full lg:w-80 shrink-0 rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Enviar mensaje</h3>
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-500">
          Para enviar un mensaje a un cliente específico, ingresá al perfil del cliente y usá la
          sección de Comunicaciones.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type Tab = 'gmail' | 'whatsapp' | 'unlinked';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'gmail', label: 'Gmail', icon: '📧' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'unlinked', label: 'Sin vincular', icon: '📭' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('gmail');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comunicaciones</h1>
        <p className="mt-1 text-sm text-gray-500">
          Historial de mensajes enviados y recibidos por todos los canales.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <span role="img" aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'gmail' && (
        <ChannelTab channel="gmail" label="Gmail" icon="📧" />
      )}
      {activeTab === 'whatsapp' && (
        <ChannelTab channel="whatsapp" label="WhatsApp" icon="💬" />
      )}
      {activeTab === 'unlinked' && (
        <div>
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Mensajes sin cliente asignado
          </h2>
          <UnlinkedInbox />
        </div>
      )}
    </div>
  );
}
