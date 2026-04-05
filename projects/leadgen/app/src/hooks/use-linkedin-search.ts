"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  LinkedInSearchResponse,
  LinkedInSearchResult,
} from "@/lib/linkedin-constants";

interface SearchFilters {
  keyword: string;
  geo_code: string;
  page: number;
}

async function searchLinkedIn(
  filters: SearchFilters
): Promise<LinkedInSearchResponse> {
  const params = new URLSearchParams({
    keyword: filters.keyword,
    page: String(filters.page),
  });
  if (filters.geo_code) {
    params.set("geo_code", filters.geo_code);
  }

  const res = await fetch(`/api/linkedin/search?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Search failed" }));
    throw new Error(err.error || "Search failed");
  }
  return res.json();
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  skippedDetails: string[];
  leadIds: string[];
}

async function importProfiles(
  profiles: LinkedInSearchResult[]
): Promise<ImportResult> {
  const res = await fetch("/api/linkedin/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profiles }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Import failed" }));
    throw new Error(err.error || "Import failed");
  }
  return res.json();
}

export function useLinkedInSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ["linkedin-search", filters],
    queryFn: () => searchLinkedIn(filters),
    enabled: !!filters.keyword,
    staleTime: 5 * 60 * 1000,
  });
}

export function useImportLinkedInProfiles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: importProfiles,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
