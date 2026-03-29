import { differenceInDays, formatDistanceToNow, isPast, isWithinInterval, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Opportunity } from '../pipeline.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the due date icon badge for an opportunity's activities.
 * - "⚠️" if the due date has already passed
 * - "⏰" if the due date is within the next 3 days
 * - null otherwise (date is far away or not set)
 */
export function getDueDateBadge(dueAt: string | null | undefined): '⚠️' | '⏰' | null {
  if (!dueAt) return null;

  const due = typeof dueAt === 'string' ? parseISO(dueAt) : dueAt;
  const now = new Date();

  if (isPast(due)) {
    return '⚠️';
  }

  const threeDaysFromNow = addDays(now, 3);
  if (
    isWithinInterval(due, { start: now, end: threeDaysFromNow })
  ) {
    return '⏰';
  }

  return null;
}

/**
 * Formats the last activity date as a human-readable relative string.
 * Returns "Sin actividad" if no date is provided.
 */
export function formatLastActivity(lastActivityAt: string | null | undefined): string {
  if (!lastActivityAt) return 'Sin actividad';

  const date = typeof lastActivityAt === 'string' ? parseISO(lastActivityAt) : lastActivityAt;
  const days = differenceInDays(new Date(), date);

  if (days === 0) return 'Última actividad: hoy';
  if (days === 1) return 'Última actividad: hace 1 día';
  return `Última actividad: hace ${days} días`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface KanbanCardProps {
  opportunity: Opportunity;
  /** Due date of the most urgent pending activity linked to this opportunity */
  nearestDueAt?: string | null;
  onClick?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KanbanCard({ opportunity, nearestDueAt, onClick }: KanbanCardProps) {
  const { client, motoInterest, lastActivityAt } = opportunity;
  const clientName = `${client.firstName} ${client.lastName}`;
  const lastActivityLabel = formatLastActivity(lastActivityAt);
  const dueBadge = getDueDateBadge(nearestDueAt);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      data-testid="kanban-card"
      className="group relative flex cursor-pointer flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Header: client name + due date badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-gray-900 leading-tight">{clientName}</span>
        {dueBadge && (
          <span
            role="img"
            aria-label={dueBadge === '⚠️' ? 'Vencida' : 'Próxima a vencer'}
            data-testid={dueBadge === '⚠️' ? 'badge-overdue' : 'badge-soon'}
            className="text-base leading-none flex-shrink-0"
          >
            {dueBadge}
          </span>
        )}
      </div>

      {/* Moto interest */}
      {motoInterest && (
        <p className="text-xs text-gray-600 leading-snug line-clamp-2">{motoInterest}</p>
      )}

      {/* Last activity — RF-11 */}
      <p
        data-testid="last-activity-label"
        className="text-xs text-gray-400 mt-auto"
      >
        {lastActivityLabel}
      </p>
    </article>
  );
}
