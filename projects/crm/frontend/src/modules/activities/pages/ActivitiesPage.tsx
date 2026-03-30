import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { PageHeader } from '../../../components/ui/PageHeader';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { IconCalendar, IconPhone, IconMeeting, IconTask } from '../../../components/ui/Icons';
import { useActivitiesList, useMarkActivityDone } from '../hooks/useActivities';
import { useUsersList } from '../../users/hooks/useUsers';
import { ActivityCalendar } from '../components/ActivityCalendar';
import type { ActivityStatus, ActivityType } from '../activities.types';

// ---------------------------------------------------------------------------
// Icon helpers
// ---------------------------------------------------------------------------

function ActivityTypeIcon({ type }: { type: ActivityType }) {
  if (type === 'llamada') {
    return (
      <span
        aria-label="Llamada"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
      >
        <IconPhone width={14} height={14} />
      </span>
    );
  }
  if (type === 'reunion') {
    return (
      <span
        aria-label="Reunion"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600"
      >
        <IconMeeting width={14} height={14} />
      </span>
    );
  }
  return (
    <span
      aria-label="Tarea"
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"
    >
      <IconTask width={14} height={14} />
    </span>
  );
}

const TYPE_LABELS: Record<ActivityType, string> = {
  llamada: 'Llamada',
  reunion: 'Reunion',
  tarea: 'Tarea',
};

// ---------------------------------------------------------------------------
// View mode type
// ---------------------------------------------------------------------------

type ViewMode = 'table' | 'calendar';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ActivitiesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [status, setStatus] = useState<ActivityStatus | ''>('');
  const [type, setType] = useState<ActivityType | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [overdue, setOverdue] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');

  const params = {
    ...(status && { status }),
    ...(type && { type }),
    ...(dateFrom && { dateFrom: `${dateFrom}T00:00:00.000Z` }),
    ...(dateTo && { dateTo: `${dateTo}T23:59:59.999Z` }),
    ...(overdue && { overdue: true }),
    ...(assignedTo && { assignedTo }),
  };

  const { data, isLoading, isError } = useActivitiesList(params);
  const { data: users } = useUsersList();
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
      toast.error('No se pudo actualizar la actividad. Intenta nuevamente.');
    }
  }

  function isOverdue(activity: { status: ActivityStatus; scheduledAt: string; dueAt?: string | null }) {
    if (activity.status === 'realizada') return false;
    const dateToCheck = activity.dueAt ?? activity.scheduledAt;
    return isPast(parseISO(dateToCheck));
  }

  const hasActiveFilters = !!(status || type || dateFrom || dateTo || overdue || assignedTo);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <PageHeader
        title="Actividades"
        subtitle={`${data?.meta.total ?? 0} actividades en total`}
      />

      {/* Filters + View Toggle */}
      <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-end gap-4">
          {/* View mode toggle */}
          <div className="min-w-[180px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Vista
            </label>
            <div className="inline-flex rounded-lg border border-surface-200 bg-surface-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                Calendario
              </button>
            </div>
          </div>

          {/* Estado */}
          <div className="min-w-[140px]">
            <label htmlFor="filter-status" className="block text-xs font-medium text-gray-600 mb-1">
              Estado
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ActivityStatus | '')}
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Todos</option>
              <option value="llamada">Llamada</option>
              <option value="reunion">Reunion</option>
              <option value="tarea">Tarea</option>
            </select>
          </div>

          {/* Responsable */}
          <div className="min-w-[180px]">
            <label htmlFor="filter-assigned-to" className="block text-xs font-medium text-gray-600 mb-1">
              Responsable
            </label>
            <select
              id="filter-assigned-to"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Todos</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
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
              className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
              className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setStatus('');
                setType('');
                setDateFrom('');
                setDateTo('');
                setOverdue(false);
                setAssignedTo('');
              }}
              className="self-end pb-2 text-sm text-brand-600 hover:text-brand-800 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Content: Table or Calendar */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : isError ? (
        <div className="flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-16 text-red-600">
          <span className="text-sm">Error al cargar actividades. Intenta nuevamente.</span>
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<IconCalendar width={24} height={24} />}
          title="Sin actividades"
          description="No hay actividades que coincidan con los filtros aplicados."
        />
      ) : viewMode === 'calendar' ? (
        <ActivityCalendar activities={sorted} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-surface-200 bg-surface-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Titulo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Responsable
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Vencimiento
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {sorted.map((activity) => {
                const overdueFn = isOverdue(activity);
                return (
                  <tr
                    key={activity.id}
                    data-testid="activity-row"
                    className={cn(
                      'transition-colors hover:bg-surface-50',
                      overdueFn && 'bg-amber-50/60 hover:bg-amber-100/60',
                    )}
                  >
                    {/* Tipo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ActivityTypeIcon type={activity.type} />
                        <span className="text-xs text-gray-600">{TYPE_LABELS[activity.type]}</span>
                      </div>
                    </td>

                    {/* Titulo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('font-medium text-gray-900', overdueFn && 'text-amber-900')}>
                          {activity.title}
                        </span>
                        {overdueFn && (
                          <span
                            aria-label="Vencida"
                            className="inline-block h-2 w-2 rounded-full bg-red-500 flex-shrink-0"
                          />
                        )}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/clientes/${activity.clientId}`}
                        className="text-brand-600 hover:text-brand-800 hover:underline"
                      >
                        {activity.client
                          ? `${activity.client.firstName} ${activity.client.lastName}`
                          : activity.clientId}
                      </Link>
                    </td>

                    {/* Responsable */}
                    <td className="px-4 py-3 text-gray-700">
                      {activity.responsibleUser?.fullName ?? '--'}
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 text-gray-600">
                      {format(parseISO(activity.scheduledAt), "d 'de' MMMM yyyy", { locale: es })}
                    </td>

                    {/* Vencimiento */}
                    <td className="px-4 py-3">
                      {activity.dueAt ? (
                        <span
                          className={cn(
                            'text-gray-600',
                            overdueFn && 'font-medium text-amber-700',
                          )}
                        >
                          {format(parseISO(activity.dueAt), "d 'de' MMMM yyyy", { locale: es })}
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          activity.status === 'pendiente'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700',
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
                          className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
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
        </div>
      )}
    </div>
  );
}
