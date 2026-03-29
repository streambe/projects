import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Opportunity } from '../pipeline.types';
import { KanbanCard } from './KanbanCard';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface KanbanDraggableCardProps {
  opportunity: Opportunity;
  onClick?: () => void;
}

// ---------------------------------------------------------------------------
// Component — wraps KanbanCard with dnd-kit draggable behavior
// ---------------------------------------------------------------------------

export function KanbanDraggableCard({ opportunity, onClick }: KanbanDraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opportunity.id,
    data: { opportunity },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'touch-none',
        isDragging && 'z-50 opacity-80 shadow-lg',
      )}
    >
      <KanbanCard opportunity={opportunity} onClick={onClick} />
    </div>
  );
}
