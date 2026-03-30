import { differenceInDays, formatDistanceToNow, isPast, isWithinInterval, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Opportunity } from '../pipeline.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a due-date indicator type for an opportunity's activities.
 * - "overdue" if the due date has already passed
 * - "soon" if the due date is within the next 3 days
 * - null otherwise (date is far away or not set)
 */
export function getDueDateBadge(dueAt: string | null | undefined): 'overdue' | 'soon' | null {
  if (!dueAt) return null;

  const due = typeof dueAt === 'string' ? parseISO(dueAt) : dueAt;
  const now = new Date();

  if (isPast(due)) {
    return 'overdue';
  }

  const threeDaysFromNow = addDays(now, 3);
  if (
    isWithinInterval(due, { start: now, end: threeDaysFromNow })
  ) {
    return 'soon';
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

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Hace 1 dia';
  return `Hace ${days} dias`;
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
      className="group relative flex cursor-pointer flex-col gap-2 rounded-xl border border-surface-200 bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {/* Header: client name + due date indicator */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-gray-900 leading-tight">{clientName}</span>
        {dueBadge && (
          <span
            aria-label={dueBadge === 'overdue' ? 'Vencida' : 'Proxima a vencer'}
            data-testid={dueBadge === 'overdue' ? 'badge-overdue' : 'badge-soon'}
            className="mt-1 flex-shrink-0"
          >
            <span
              className={
                dueBadge === 'overdue'
                  ? 'inline-block h-2 w-2 rounded-full bg-red-500'
                  : 'inline-block h-2 w-2 rounded-full bg-amber-400'
              }
            />
          </span>
        )}
      </div>

      {/* Moto interest */}
      {motoInterest && (
        <p className="text-xs text-gray-500 leading-snug line-clamp-2">{motoInterest}</p>
      )}

      {/* Last activity — RF-11 */}
      <p
        data-testid="last-activity-label"
        className="text-[11px] text-gray-400 mt-auto"
      >
        {lastActivityLabel}
      </p>
    </article>
  );
}
