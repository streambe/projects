import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../../lib/utils';
import { IconPlus } from '../../../components/ui/Icons';
import type { Opportunity, OpportunityStage } from '../pipeline.types';
import { OPPORTUNITY_STAGE_LABELS } from '../pipeline.types';
import { KanbanDraggableCard } from './KanbanDraggableCard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface KanbanColumnProps {
  stage: OpportunityStage;
  opportunities: Opportunity[];
  onCardClick?: (opportunity: Opportunity) => void;
  onAddClick?: (stage: OpportunityStage) => void;
}

// ---------------------------------------------------------------------------
// Column accent colors per stage
// ---------------------------------------------------------------------------

const STAGE_ACCENT: Record<OpportunityStage, { bar: string; bg: string; badge: string }> = {
  consulta: {
    bar: 'bg-sky-500',
    bg: 'bg-sky-50',
    badge: 'bg-sky-100 text-sky-700',
  },
  prueba_manejo: {
    bar: 'bg-amber-500',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
  },
  presupuesto: {
    bar: 'bg-violet-500',
    bg: 'bg-violet-50',
    badge: 'bg-violet-100 text-violet-700',
  },
  cierre: {
    bar: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KanbanColumn({
  stage,
  opportunities,
  onCardClick,
  onAddClick,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });

  const count = opportunities.length;
  const totalValue = 0; // Value tracking not yet in the data model
  const accent = STAGE_ACCENT[stage];

  return (
    <section
      ref={setNodeRef}
      aria-label={`Columna ${OPPORTUNITY_STAGE_LABELS[stage]}`}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-2xl border border-surface-200 bg-surface-50 transition-all',
        isOver && 'border-brand-400 bg-brand-50/40 ring-2 ring-brand-200',
      )}
    >
      {/* Color bar */}
      <div className={cn('h-1.5 rounded-t-2xl', accent.bar)} />

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">
            {OPPORTUNITY_STAGE_LABELS[stage]}
          </h3>
          <span
            className={cn(
              'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-bold',
              accent.badge,
            )}
          >
            {count}
          </span>
        </div>
        {totalValue > 0 && (
          <span className="text-xs font-medium text-gray-500">
            {formatCurrency(totalValue)}
          </span>
        )}
      </div>

      {/* Cards container — scrollable */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pb-2.5" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        {opportunities.map((opp) => (
          <KanbanDraggableCard
            key={opp.id}
            opportunity={opp}
            onClick={() => onCardClick?.(opp)}
          />
        ))}

        {count === 0 && (
          <div className={cn('flex items-center justify-center rounded-xl py-8 text-xs text-gray-400', accent.bg)}>
            Sin oportunidades
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="border-t border-surface-200 p-2">
        <button
          type="button"
          onClick={() => onAddClick?.(stage)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium text-accent-500 transition-colors hover:bg-accent-50 hover:text-accent-600"
        >
          <IconPlus width={14} height={14} />
          Agregar
        </button>
      </div>
    </section>
  );
}
