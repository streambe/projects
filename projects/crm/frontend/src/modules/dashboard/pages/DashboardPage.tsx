import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDashboardStats } from '../hooks/useDashboard';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { CardSkeleton } from '../../../components/ui/Skeleton';
import {
  IconUsers,
  IconPipeline,
  IconCalendar,
  IconChart,
  IconPhone,
  IconMeeting,
  IconTask,
  IconWarning,
  IconClock,
} from '../../../components/ui/Icons';
import { cn } from '../../../lib/utils';

// ---------------------------------------------------------------------------
// Stage config
// ---------------------------------------------------------------------------

const STAGE_CONFIG = {
  consulta: { label: 'Consulta', color: 'bg-sky-500' },
  prueba_manejo: { label: 'Prueba de manejo', color: 'bg-amber-500' },
  presupuesto: { label: 'Presupuesto', color: 'bg-violet-500' },
  cierre: { label: 'Cierre', color: 'bg-emerald-500' },
} as const;

const ACTIVITY_ICON_MAP = {
  llamada: { icon: IconPhone, bg: 'bg-sky-50', text: 'text-sky-600' },
  reunion: { icon: IconMeeting, bg: 'bg-amber-50', text: 'text-amber-600' },
  tarea: { icon: IconTask, bg: 'bg-violet-50', text: 'text-violet-600' },
} as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PipelineBar({
  stages,
}: {
  stages: { consulta: number; prueba_manejo: number; presupuesto: number; cierre: number };
}) {
  const total = stages.consulta + stages.prueba_manejo + stages.presupuesto + stages.cierre;

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Pipeline por etapa
        </h2>
        <p className="mt-4 text-sm text-gray-400">Sin oportunidades en el pipeline.</p>
      </div>
    );
  }

  const entries = (Object.keys(STAGE_CONFIG) as (keyof typeof STAGE_CONFIG)[]).map((key) => ({
    key,
    count: stages[key],
    pct: Math.round((stages[key] / total) * 100),
    ...STAGE_CONFIG[key],
  }));

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        Pipeline por etapa
      </h2>

      {/* Stacked bar */}
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-surface-100">
        {entries.map(
          (entry) =>
            entry.count > 0 && (
              <div
                key={entry.key}
                className={cn('h-full transition-all duration-500', entry.color)}
                style={{ width: `${entry.pct}%` }}
              />
            ),
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {entries.map((entry) => (
          <div key={entry.key} className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', entry.color)} />
            <div>
              <p className="text-xs text-gray-500">{entry.label}</p>
              <p className="text-sm font-bold text-gray-900">{entry.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityRow({
  activity,
}: {
  activity: {
    id: string;
    type: 'llamada' | 'reunion' | 'tarea';
    title: string;
    clientName: string;
    scheduledAt: string;
    status: 'pendiente' | 'realizada';
  };
}) {
  const config = ACTIVITY_ICON_MAP[activity.type];
  const ActivityIcon = config.icon;
  const isPending = activity.status === 'pendiente';

  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      {/* Type icon */}
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', config.bg)}>
        <ActivityIcon className={config.text} width={18} height={18} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="truncate text-xs text-gray-500">{activity.clientName}</p>
      </div>

      {/* Date */}
      <div className="hidden items-center gap-1.5 text-xs text-gray-400 sm:flex">
        <IconClock width={14} height={14} />
        <span>{format(parseISO(activity.scheduledAt), "d MMM yyyy, HH:mm", { locale: es })}</span>
      </div>

      {/* Status badge */}
      <span
        className={cn(
          'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
          isPending ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
        )}
      >
        {isPending ? 'Pendiente' : 'Realizada'}
      </span>

      {/* Link to client */}
      <Link
        to={`/clients/${activity.id}`}
        className="shrink-0 text-xs font-medium text-brand-500 hover:text-brand-700 transition-colors"
      >
        Ver
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  const todayFormatted = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es });

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle={todayFormatted} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // --- Error state ---
  if (isError || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle={todayFormatted} />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <IconWarning className="mx-auto text-red-400" width={32} height={32} />
          <p className="mt-2 text-sm font-medium text-red-700">
            No se pudieron cargar las estadisticas. Intenta de nuevo mas tarde.
          </p>
        </div>
      </div>
    );
  }

  // --- Overdue trend ---
  const overdueTrend =
    stats.overdueActivities > 0
      ? { value: `${stats.overdueActivities} vencidas`, positive: false }
      : undefined;

  // --- Conversion rate display ---
  const conversionDisplay = `${stats.conversionRate}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title="Dashboard" subtitle={todayFormatted} />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total clientes"
          value={stats.totalClients}
          icon={<IconUsers />}
          trend={
            stats.newClientsThisMonth > 0
              ? { value: `${stats.newClientsThisMonth} este mes`, positive: true }
              : undefined
          }
        />
        <StatCard
          label="Oportunidades abiertas"
          value={stats.openOpportunities}
          icon={<IconPipeline />}
        />
        <StatCard
          label="Actividades pendientes"
          value={stats.pendingActivities}
          icon={<IconCalendar />}
          trend={overdueTrend}
        />
        <StatCard
          label="Tasa de conversion"
          value={conversionDisplay}
          icon={<IconChart />}
        />
      </div>

      {/* Pipeline by stage */}
      <PipelineBar stages={stats.pipelineByStage} />

      {/* Recent activities */}
      <div className="rounded-2xl border border-surface-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Actividades recientes
          </h2>
          <Link
            to="/activities"
            className="text-xs font-medium text-brand-500 hover:text-brand-700 transition-colors"
          >
            Ver todas
          </Link>
        </div>

        {stats.recentActivities.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400">Sin actividades recientes.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {stats.recentActivities.slice(0, 5).map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
