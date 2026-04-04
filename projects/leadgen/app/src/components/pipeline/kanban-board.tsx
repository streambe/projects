"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LeadCard } from "./lead-card";
import { LeadDetailSheet } from "@/components/leads/lead-detail-sheet";
import { useLeads, useUpdateLead } from "@/hooks/use-leads";
import { Stage } from "@/types";
import type { Lead } from "@/types";

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: Stage.NEW, label: "New", color: "bg-slate-500" },
  { key: Stage.CONNECTED, label: "Connected", color: "bg-sky-500" },
  { key: Stage.ENGAGED, label: "Engaged", color: "bg-blue-500" },
  { key: Stage.MQL, label: "MQL", color: "bg-indigo-500" },
  { key: Stage.SQL, label: "SQL", color: "bg-violet-500" },
  { key: Stage.MEETING_SCHEDULED, label: "Meeting", color: "bg-purple-500" },
  { key: Stage.PROPOSAL_SENT, label: "Proposal", color: "bg-fuchsia-500" },
  { key: Stage.NEGOTIATION, label: "Negotiation", color: "bg-amber-500" },
  { key: Stage.WON, label: "Won", color: "bg-emerald-500" },
  { key: Stage.LOST, label: "Lost", color: "bg-red-500" },
];

type LeadWithCompany = Lead & { company?: { name: string } | null };

interface KanbanColumnProps {
  stage: (typeof STAGES)[number];
  leads: LeadWithCompany[];
  onCardClick: (leadId: string) => void;
}

function KanbanColumn({ stage, leads, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col shrink-0 w-72 rounded-xl transition-colors ${
        isOver ? "bg-blue-50 ring-2 ring-blue-300" : "bg-slate-50/80"
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-200">
        <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
        <span className="text-sm font-semibold text-slate-700">{stage.label}</span>
        <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-200/60 rounded-full px-2 py-0.5">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 min-h-[120px] flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onCardClick(lead.id)}
            />
          ))}
          {leads.length === 0 && (
            <div className="flex items-center justify-center h-20 text-xs text-slate-400">
              Drop leads here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface KanbanBoardProps {
  search?: string;
  stageFilter?: Stage;
  scoreMin?: number;
  scoreMax?: number;
}

export function KanbanBoard({ search, stageFilter, scoreMin, scoreMax }: KanbanBoardProps) {
  const { data: leads = [], isLoading } = useLeads({
    search,
    stage: stageFilter,
    scoreMin,
    scoreMax,
  });
  const updateLead = useUpdateLead();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const leadsByStage = useMemo(() => {
    const map: Record<string, LeadWithCompany[]> = {};
    for (const s of STAGES) map[s.key] = [];
    for (const lead of leads as LeadWithCompany[]) {
      if (map[lead.stage]) map[lead.stage].push(lead);
    }
    return map;
  }, [leads]);

  const activeLead = useMemo(
    () => (leads as LeadWithCompany[]).find((l) => l.id === activeId) ?? null,
    [leads, activeId]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // visual feedback handled by isOver in columns
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const leadId = String(active.id);
      const overId = String(over.id);

      // Check if dropped over a stage column
      const targetStage = STAGES.find((s) => s.key === overId);
      if (targetStage) {
        const lead = (leads as LeadWithCompany[]).find((l) => l.id === leadId);
        if (lead && lead.stage !== targetStage.key) {
          updateLead.mutate({ id: leadId, stage: targetStage.key } as { id: string } & Partial<Lead>);
        }
        return;
      }

      // Dropped over another card — find which column that card is in
      const targetLead = (leads as LeadWithCompany[]).find((l) => l.id === overId);
      if (targetLead) {
        const lead = (leads as LeadWithCompany[]).find((l) => l.id === leadId);
        if (lead && lead.stage !== targetLead.stage) {
          updateLead.mutate({ id: leadId, stage: targetLead.stage } as { id: string } & Partial<Lead>);
        }
      }
    },
    [leads, updateLead]
  );

  const handleCardClick = useCallback((leadId: string) => {
    setSelectedLeadId(leadId);
    setSheetOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4">
        {STAGES.map((s) => (
          <div key={s.key} className="w-72 h-96 rounded-xl bg-slate-100 animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="w-full">
          <div className="flex gap-3 p-4 pb-6 min-w-max">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.key}
                stage={stage}
                leads={leadsByStage[stage.key] ?? []}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay>
          {activeLead ? (
            <div className="w-72 rotate-2 opacity-90">
              <LeadCard lead={activeLead} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <LeadDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        leadId={selectedLeadId}
      />
    </>
  );
}
