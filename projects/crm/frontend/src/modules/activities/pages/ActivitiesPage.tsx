import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { useActivitiesList, useMarkActivityDone } from '../hooks/useActivities';
import type { ActivityStatus, ActivityType } from '../activities.types';

// ---------------------------------------------------------------------------
// Icon helpers
// ---------------------------------------------------------------------------

function ActivityTypeIcon({ type }: { type: ActivityType }) {
  if (type === 'llamada') {
    return (
      <span
        role="img"
        aria-label="Llamada"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm"
      >
        📞
      </span>
    );
  }
  if (type === 'reunion') {
    return (
      <span
        role="img"
        aria-label="Reunión"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-sm"
      >
        🤝
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label="Tarea"
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-sm"
    >
      ✅
    </span>
  );
}

const TYPE_LABELS: Record<ActivityType, string> = {
  llamada: 'Llamada',
  reunion: 'Reunión',
  tarea: 'Tarea',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ActivitiesPage() {
  const [status, setStatus] = useState<ActivityStatus | ''>('');
  const [type, setType] = useState<ActivityType | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [overdue, setOverdue] = useState(false);

  const params = {
    ...(status && { status }),
    ...(type && { type }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(overdue && { overdue: true }),
  };

  const { data, isLoading, isError } = useActivitiesList(params);
  const markDone = useMarkActivityDone();

  const activities = data?.data ?? [];

  // Sort: pendientes first, then realizadas
  const sorted = [...activities].sort((a, b) => {
    if (a.status === b.status) {
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    }
    return a.status === 'pendiente' ? -1 : 1;
  });

  async function handleMarkDone(id: string) {
    try {
      await markDone.mutateAsync(id);
      toast.success('Actividad marcada como realizada');
    } catch {
      toast.error('No se pudo actualizar la actividad. Intentá nuevamente.');
    }
  }

  function isOverdue(activity: { status: ActivityStatus; scheduledAt: string; dueAt?: string | null }) {
    if (activity.status === 'realizada') return false;
    const dateToCheck = activity.dueAt ?? activity.scheduledAt;
    return isPast(parseISO(dateToCheck));
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actividades</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data?.meta.total ?? 0} actividades en total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Estado */}
          <div className="min-w-[140px]">
            <label htmlFor="filter-status" className="block text-xs font-medium text-gray-600 mb-1">
              Estado
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ActivityStatus | '')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="realizada">Realizada</option>
            </select>
          </div>

          {/* Tipo */}
          <div className="min-w-[140px]">
            <label htmlFor="filter-type" className="block text-xs font-medium text-gray-600 mb-1">
              Tipo
            </label>
            <select
              id="filter-type"
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType | '')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="llamada">Llamada</option>
              <option value="reunion">Reunión</option>
              <option value="tarea">Tarea</option>
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label htmlFor="filter-date-from" className="block text-xs font-medium text-gray-600 mb-1">
              Desde
            </label>
            <input
              id="filter-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label htmlFor="filter-date-to" className="block text-xs font-medium text-gray-600 mb-1">
              Hasta
            </label>
            <input
              id="filter-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Overdue toggle */}
          <div className="flex items-center gap-2 self-end pb-2">
            <button
              type="button"
              role="switch"
              aria-checked={overdue}
              onClick={() => setOverdue((v) => !v)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                overdue ? 'bg-amber-500' : 'bg-gray-200',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                  overdue ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">Solo vencidas</span>
          </div>

          {/* Clear filters */}
          {(status || type || dateFrom || dateTo || overdue) && (
            <button
              type="button"
              onClick={() => {
                setStatus('');
                setType('');
                setDateFrom('');
                setDateTo('');
                setOverdue(false);
              }}
              className="self-end pb-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <span className="text-sm">Cargando actividades...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16 text-red-500">
            <span className="text-sm">Error al cargar actividades. Intentá nuevamente.</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
            <span className="text-4xl">📋</span>
            <span className="text-sm">No hay actividades que coincidan con los filtros.</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Título
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((activity) => {
                const overdueFn = isOverdue(activity);
                return (
                  <tr
                    key={activity.id}
                    data-testid="activity-row"
                    className={cn(
                      'transition-colors hover:bg-gray-50',
                      overdueFn && 'bg-amber-50 hover:bg-amber-100',
                    )}
                  >
                    {/* Tipo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ActivityTypeIcon type={activity.type} />
                        <span className="text-xs text-gray-600">{TYPE_LABELS[activity.type]}</span>
                      </div>
                    </td>

                    {/* Título */}
                    <td className="px-4 py-3">
                      <span className={cn('font-medium text-gray-900', overdueFn && 'text-amber-900')}>
                        {activity.title}
                      </span>
                      {overdueFn && (
                        <span
                          role="img"
                          aria-label="Vencida"
                          className="ml-2 text-amber-500"
                        >
                          ⚠️
                        </span>
                      )}
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/clientes/${activity.clientId}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {activity.clientId}
                      </Link>
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 text-gray-600">
                      {format(parseISO(activity.scheduledAt), "d 'de' MMMM yyyy", { locale: es })}
                    </td>

                    {/* Estado */}
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

                    {/* Acciones */}
                    <td className="px-4 py-3 text-right">
                      {activity.status === 'pendiente' && (
                        <button
                          type="button"
                          onClick={() => void handleMarkDone(activity.id)}
                          disabled={markDone.isPending}
                          className="rounded-lg border border-green-300 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                        >
                          Marcar realizada
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
