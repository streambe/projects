import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
import type { Opportunity, OpportunityStage, OpportunityResult } from '../pipeline.types';
import { OPPORTUNITY_STAGE } from '../pipeline.types';
import { usePipelineOpportunities, pipelineQueryKeys } from '../hooks/usePipeline';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { CloseOpportunityDialog } from './CloseOpportunityDialog';

// ---------------------------------------------------------------------------
// Ordered stages for the board
// ---------------------------------------------------------------------------

const STAGES: OpportunityStage[] = [
  OPPORTUNITY_STAGE.consulta,
  OPPORTUNITY_STAGE.prueba_manejo,
  OPPORTUNITY_STAGE.presupuesto,
  OPPORTUNITY_STAGE.cierre,
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface KanbanBoardProps {
  filterVendedor?: string;
  filterSucursal?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KanbanBoard({ filterVendedor, filterSucursal }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = usePipelineOpportunities({ isOpen: true });

  // Active drag state
  const [activeOpportunity, setActiveOpportunity] = useState<Opportunity | null>(null);

  // Close dialog state
  const [closingOpportunity, setClosingOpportunity] = useState<Opportunity | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Sensors with activation constraints to avoid accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  // -------------------------------------------------------------------------
  // Group opportunities by stage (filtered)
  // -------------------------------------------------------------------------

  const opportunities = data?.data ?? [];

  const filteredOpportunities = useMemo(() => {
    let result = opportunities;
    if (filterVendedor) {
      result = result.filter((o) => o.assignedUserId === filterVendedor);
    }
    // Sucursal filtering requires a branch field on the opportunity model;
    // currently a no-op until that data is available in the API.
    void filterSucursal;
    return result;
  }, [opportunities, filterVendedor, filterSucursal]);

  const groupedByStage = useMemo(() => {
    const groups: Record<OpportunityStage, Opportunity[]> = {
      consulta: [],
      prueba_manejo: [],
      presupuesto: [],
      cierre: [],
    };
    for (const opp of filteredOpportunities) {
      if (groups[opp.stage]) {
        groups[opp.stage].push(opp);
      }
    }
    return groups;
  }, [filteredOpportunities]);

  // -------------------------------------------------------------------------
  // Stage change helper
  // -------------------------------------------------------------------------

  const changeStage = useCallback(
    async (opportunityId: string, stage: OpportunityStage, result?: OpportunityResult, lostReason?: string) => {
      try {
        await api.put(`/opportunities/${opportunityId}/stage`, {
          stage,
          ...(result !== undefined && { result }),
          ...(lostReason !== undefined && { lostReason }),
        });
        void queryClient.invalidateQueries({ queryKey: pipelineQueryKeys.all });
        return true;
      } catch {
        toast.error('Error al cambiar la etapa');
        return false;
      }
    },
    [queryClient],
  );

  // -------------------------------------------------------------------------
  // Drag handlers
  // -------------------------------------------------------------------------

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const opp = (event.active.data.current as { opportunity: Opportunity } | undefined)?.opportunity;
    setActiveOpportunity(opp ?? null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveOpportunity(null);

      const { active, over } = event;
      if (!over) return;

      const opp = (active.data.current as { opportunity: Opportunity } | undefined)?.opportunity;
      if (!opp) return;

      const targetStage = over.id as OpportunityStage;
      if (targetStage === opp.stage) return;

      // If the target is "cierre", open the close dialog
      if (targetStage === OPPORTUNITY_STAGE.cierre) {
        setClosingOpportunity(opp);
        return;
      }

      // Otherwise move directly
      void changeStage(opp.id, targetStage).then((ok) => {
        if (ok) toast.success('Etapa actualizada');
      });
    },
    [changeStage],
  );

  // -------------------------------------------------------------------------
  // Close dialog handlers
  // -------------------------------------------------------------------------

  const handleCloseConfirm = useCallback(
    async (result: OpportunityResult, lostReason?: string) => {
      if (!closingOpportunity) return;
      setIsClosing(true);

      const ok = await changeStage(
        closingOpportunity.id,
        OPPORTUNITY_STAGE.cierre,
        result,
        lostReason,
      );

      setIsClosing(false);

      if (ok) {
        toast.success(result === 'ganado' ? 'Oportunidad ganada' : 'Oportunidad cerrada como perdida');
        setClosingOpportunity(null);
      }
    },
    [closingOpportunity, changeStage],
  );

  const handleCloseCancel = useCallback(() => {
    setClosingOpportunity(null);
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        <span className="ml-3 text-sm text-gray-500">Cargando pipeline...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-red-500">
        Error al cargar las oportunidades. Intenta recargar la pagina.
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              opportunities={groupedByStage[stage]}
            />
          ))}
        </div>

        {/* Drag overlay — renders the card being dragged outside the normal flow */}
        <DragOverlay dropAnimation={null}>
          {activeOpportunity ? (
            <div className="w-72 rotate-2 shadow-xl">
              <KanbanCard opportunity={activeOpportunity} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Close opportunity dialog */}
      {closingOpportunity && (
        <CloseOpportunityDialog
          opportunity={closingOpportunity}
          onConfirm={handleCloseConfirm}
          onCancel={handleCloseCancel}
          isPending={isClosing}
        />
      )}
    </>
  );
}
