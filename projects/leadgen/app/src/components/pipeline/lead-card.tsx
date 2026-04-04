"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, GripVertical } from "lucide-react";
import type { Lead } from "@/types";

function scoreColor(score: number) {
  if (score >= 70) return "bg-red-500/10 text-red-700 border-red-200";
  if (score >= 40) return "bg-orange-500/10 text-orange-700 border-orange-200";
  if (score >= 20) return "bg-amber-500/10 text-amber-700 border-amber-200";
  return "bg-[#F5F7FF] text-[#666666] border-[#E8EBFF]";
}

interface LeadCardProps {
  lead: Lead & { company?: { name: string } | null };
  onClick: () => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group bg-white border border-[rgba(0,0,0,0.05)] rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
        isDragging ? "opacity-50 shadow-lg ring-2 ring-[#3957ED]/40" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <button
            className="mt-0.5 cursor-grab active:cursor-grabbing text-[#E8EBFF] hover:text-[#3957ED] opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-sm text-[#141414] truncate">
                {lead.firstName} {lead.lastName}
              </p>
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold px-1.5 py-0 shrink-0 rounded-full ${scoreColor(lead.score)}`}
              >
                {lead.score}
              </Badge>
            </div>

            {lead.title && (
              <p className="text-xs text-[#666666] truncate mt-0.5">{lead.title}</p>
            )}

            {(lead as LeadCardProps["lead"]).company?.name && (
              <div className="flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3 text-[#999999]" />
                <span className="text-xs text-[#666666] truncate">
                  {(lead as LeadCardProps["lead"]).company!.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
