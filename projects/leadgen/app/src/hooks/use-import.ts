"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportResult } from "@/lib/import-utils";
import type { ColumnMapping } from "@/lib/import-utils";
import type { Lead } from "@/types";

async function importCsv(data: {
  csvText: string;
  mapping: ColumnMapping;
}): Promise<ImportResult> {
  const res = await fetch("/api/import/csv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Import failed" }));
    throw new Error(err.error || "Import failed");
  }
  return res.json();
}

async function importLinkedIn(url: string): Promise<Lead> {
  const res = await fetch("/api/import/linkedin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Import failed" }));
    throw new Error(err.error || "Import failed");
  }
  return res.json();
}

export function useImportCsv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: importCsv,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useImportLinkedIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: importLinkedIn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}
