import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useClientDetail } from '../hooks/useClients';
import { useClientActivities } from '../../activities/hooks/useActivities';
import { MessageThread } from '../../communications/components/MessageThread';
import { SendMessageForm } from '../../communications/components/SendMessageForm';
import { useClientMessages } from '../../communications/hooks/useCommunications';
import { cn } from '../../../lib/utils';
import { IconUsers } from '../../../components/ui/Icons';
import { EmptyState } from '../../../components/ui/EmptyState';
import type { ActivityType } from '../../activities/activities.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HOW_FOUND_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
  referido: 'Referido',
  visita_directa: 'Visita directa',
  otro: 'Otro',
};

const TYPE_LABELS: Record<ActivityType, string> = {
  llamada: 'Llamada',
  reunion: 'Reunion',
  tarea: 'Tarea',
};

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type Tab = 'info' | 'activities' | 'communications';

const TABS: { id: Tab; label: string }[] = [
  { id: 'info', label: 'Informacion' },
  { id: 'activities', label: 'Actividades' },
  { id: 'communications', label: 'Comunicaciones' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ClientProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const { data: client, isLoading, isError } = useClientDetail(id);
  const { data: activitiesData } = useClientActivities(id);
  const { data: messagesData, isLoading: messagesLoading } = useClientMessages(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span className="text-sm text-gray-400">Cargando perfil del cliente...</span>
        </div>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-gray-400">
          <IconUsers width={28} height={28} />
        </div>
        <p className="text-sm text-gray-500">No se encontro el cliente.</p>
        <Link
          to="/clientes"
          className="text-sm font-medium text-brand-500 transition-colors hover:text-brand-600"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  const activities = activitiesData?.data ?? [];
  const messages = messagesData?.data ?? [];

  const initials = `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          to="/clientes"
          className="text-gray-400 transition-colors hover:text-brand-500"
        >
          Clientes
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-700">
          {client.firstName} {client.lastName}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-lg font-bold text-white shadow-sm">
          {initials}
        </div>

        <div className="flex flex-1 flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {client.firstName} {client.lastName}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">DNI: {client.dni}</p>
          </div>

          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
              client.isActive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-surface-200 text-gray-600',
            )}
          >
            {client.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Pill Tabs */}
      <div className="rounded-xl bg-surface-100 p-1" role="tablist">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Telefono principal" value={client.phonePrimary} />
          {client.phoneAlt && <InfoCard label="Telefono alternativo" value={client.phoneAlt} />}
          {client.email && <InfoCard label="Correo electronico" value={client.email} />}
          {client.whatsappNumber && <InfoCard label="WhatsApp" value={client.whatsappNumber} />}
          {client.city && <InfoCard label="Ciudad" value={client.city} />}
          {client.province && <InfoCard label="Provincia" value={client.province} />}
          {client.birthDate && (
            <InfoCard
              label="Fecha de nacimiento"
              value={format(parseISO(client.birthDate), "d 'de' MMMM yyyy", { locale: es })}
            />
          )}
          {client.howFoundUs && (
            <InfoCard
              label="Como nos conocio"
              value={HOW_FOUND_LABELS[client.howFoundUs] ?? client.howFoundUs}
            />
          )}
          <InfoCard
            label="Cliente desde"
            value={format(parseISO(client.createdAt), "d 'de' MMMM yyyy", { locale: es })}
          />
          {client.notes && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Notas internas
              </p>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Activities */}
      {activeTab === 'activities' && (
        <div>
          {activities.length === 0 ? (
            <EmptyState
              icon={<IconUsers width={24} height={24} />}
              title="Sin actividades registradas"
              description="Este cliente no tiene actividades registradas todavia."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
              <table className="w-full text-sm">
                <thead className="border-b border-surface-200 bg-surface-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Tipo
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Titulo
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Fecha
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="transition-colors hover:bg-surface-50"
                    >
                      <td className="px-5 py-3.5 text-gray-600">
                        {TYPE_LABELS[activity.type]}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {activity.title}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {format(parseISO(activity.scheduledAt), "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            activity.status === 'pendiente'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700',
                          )}
                        >
                          {activity.status === 'pendiente' ? 'Pendiente' : 'Realizada'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Communications */}
      {activeTab === 'communications' && (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Thread */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
            <div className="border-b border-surface-200 bg-surface-50 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-gray-700">Historial de mensajes</h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <MessageThread messages={messages} isLoading={messagesLoading} />
            </div>
          </div>

          {/* Send form */}
          <div className="w-full shrink-0 rounded-2xl border border-surface-200 bg-white p-5 shadow-card lg:w-80">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Enviar mensaje</h3>
            <SendMessageForm
              clientId={id}
              hasEmail={!!client.email}
              hasWhatsApp={!!client.whatsappNumber}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Info card sub-component
// ---------------------------------------------------------------------------

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
