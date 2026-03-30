import { useState } from 'react';
import { MessageThread } from '../components/MessageThread';
import { SendMessageForm } from '../components/SendMessageForm';
import { UnlinkedInbox } from '../components/UnlinkedInbox';
import { useChannelMessages } from '../hooks/useCommunications';
import { PageHeader } from '../../../components/ui/PageHeader';
import type { CommChannel } from '../communications.types';
import { cn } from '../../../lib/utils';

// ---------------------------------------------------------------------------
// Channel dot colors
// ---------------------------------------------------------------------------

const CHANNEL_DOT: Record<string, string> = {
  gmail: 'bg-red-500',
  whatsapp: 'bg-green-500',
  unlinked: 'bg-gray-400',
};

// ---------------------------------------------------------------------------
// Channel tab panel
// ---------------------------------------------------------------------------

function ChannelTab({
  channel,
  label,
  dotColor,
}: {
  channel: CommChannel;
  label: string;
  dotColor: string;
}) {
  const { data, isLoading } = useChannelMessages(channel);
  const messages = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Thread */}
      <div className="flex-1 rounded-2xl border border-surface-200 bg-white shadow-card overflow-hidden">
        <div className="border-b border-surface-100 px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span className={cn('h-2 w-2 rounded-full', dotColor)} />
            Historial -- {label}
          </h2>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <MessageThread messages={messages} isLoading={isLoading} />
        </div>
      </div>

      {/* Send form -- no clientId on global page, show informational message */}
      <div className="w-full lg:w-80 shrink-0 rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Enviar mensaje</h3>
        <p className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-xs leading-relaxed text-gray-500">
          Para enviar un mensaje a un cliente especifico, ingresa al perfil del cliente y usa la
          seccion de Comunicaciones.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type Tab = 'gmail' | 'whatsapp' | 'unlinked';

const TABS: { id: Tab; label: string; dotColor: string }[] = [
  { id: 'gmail', label: 'Gmail', dotColor: CHANNEL_DOT.gmail },
  { id: 'whatsapp', label: 'WhatsApp', dotColor: CHANNEL_DOT.whatsapp },
  { id: 'unlinked', label: 'Sin vincular', dotColor: CHANNEL_DOT.unlinked },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('gmail');

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Comunicaciones"
        subtitle="Historial de mensajes enviados y recibidos por todos los canales."
      />

      {/* Pill-style tab bar */}
      <div
        role="tablist"
        className="inline-flex gap-1 rounded-xl bg-surface-100 p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', tab.dotColor)} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'gmail' && (
        <ChannelTab channel="gmail" label="Gmail" dotColor={CHANNEL_DOT.gmail} />
      )}
      {activeTab === 'whatsapp' && (
        <ChannelTab channel="whatsapp" label="WhatsApp" dotColor={CHANNEL_DOT.whatsapp} />
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
