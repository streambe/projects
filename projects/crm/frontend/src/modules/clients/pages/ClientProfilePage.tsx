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
  reunion: 'Reunión',
  tarea: 'Tarea',
};

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type Tab = 'info' | 'activities' | 'communications';

const TABS: { id: Tab; label: string }[] = [
  { id: 'info', label: 'Información' },
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
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="text-sm">Cargando perfil del cliente...</span>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <span className="text-3xl">😕</span>
        <p className="text-sm">No se encontró el cliente.</p>
        <Link to="/clientes" className="text-sm text-blue-600 hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  const activities = activitiesData?.data ?? [];
  const messages = messagesData?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <Link to="/clientes" className="hover:text-blue-600 hover:underline">
          Clientes
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-900">
          {client.firstName} {client.lastName}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {client.firstName} {client.lastName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">DNI: {client.dni}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
            client.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600',
          )}
        >
          {client.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
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
          <InfoCard label="Teléfono principal" value={client.phonePrimary} />
          {client.phoneAlt && <InfoCard label="Teléfono alternativo" value={client.phoneAlt} />}
          {client.email && <InfoCard label="Correo electrónico" value={client.email} />}
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
              label="Cómo nos conoció"
              value={HOW_FOUND_LABELS[client.howFoundUs] ?? client.howFoundUs}
            />
          )}
          <InfoCard
            label="Cliente desde"
            value={format(parseISO(client.createdAt), "d 'de' MMMM yyyy", { locale: es })}
          />
          {client.notes && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Notas internas</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Activities */}
      {activeTab === 'activities' && (
        <div>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400 rounded-xl border border-gray-200 bg-white">
              <span className="text-3xl">📋</span>
              <span className="text-sm">Este cliente no tiene actividades registradas.</span>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Título</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[activity.type]}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{activity.title}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(parseISO(activity.scheduledAt), "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            activity.status === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800',
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
          <div className="flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Historial de mensajes</h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <MessageThread messages={messages} isLoading={messagesLoading} />
            </div>
          </div>

          {/* Send form */}
          <div className="w-full lg:w-80 shrink-0 rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Enviar mensaje</h3>
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
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
