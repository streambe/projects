"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KanbanBoard } from "@/components/pipeline/kanban-board";

export default function PipelinePage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.05)]">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[#141414]">
            Pipeline
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Vista Kanban de las etapas de leads
          </p>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#999999]" />
          <Input
            placeholder="Buscar leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-full border-[#E8EBFF] bg-[#F5F7FF] text-[#141414] placeholder:text-[#999999] focus-visible:ring-[#3957ED] transition-all duration-200"
          />
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard search={search || undefined} />
      </div>
    </div>
  );
}
