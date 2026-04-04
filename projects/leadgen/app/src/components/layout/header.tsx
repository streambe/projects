"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const BREADCRUMB_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pipeline": "Pipeline",
  "/sequences": "Sequences",
  "/actions": "Actions",
  "/templates": "Templates",
  "/import": "Import",
};

export function Header() {
  const pathname = usePathname();
  const pageTitle = BREADCRUMB_LABELS[pathname] || "LeadGen";

  return (
    <header className="flex h-14 items-center justify-between border-b border-[rgba(0,0,0,0.05)] bg-white px-6">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-[#141414] tracking-tight">{pageTitle}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999999]" />
          <Input
            placeholder="Search..."
            className="h-9 w-56 rounded-full border-[#E8EBFF] bg-[#F5F7FF] pl-9 text-xs text-[#141414] placeholder:text-[#999999] focus-visible:ring-[#3957ED] transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
}
