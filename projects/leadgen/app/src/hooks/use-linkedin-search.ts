"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  LinkedInEmployee,
  SearchStartResponse,
  SearchStatusResponse,
  SearchResultsResponse,
} from "@/lib/linkedin-constants";

// ── Start search ──

interface SearchParams {
  title_keywords: string[];
  geo_codes: number[];
  keywords: string;
  limit: number;
}

async function startSearch(params: SearchParams): Promise<SearchStartResponse> {
  const res = await fetch("/api/linkedin/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Search failed" }));
    throw new Error(err.error || "Search failed");
  }
  return res.json();
}

export function useStartLinkedInSearch() {
  return useMutation({
    mutationFn: startSearch,
  });
}

// ── Poll status ──

async function checkStatus(requestId: string): Promise<SearchStatusResponse> {
  const res = await fetch(
    `/api/linkedin/search/status?request_id=${encodeURIComponent(requestId)}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Status check failed" }));
    throw new Error(err.error || "Status check failed");
  }
  return res.json();
}

export function useSearchStatus(requestId: string | null) {
  return useQuery({
    queryKey: ["linkedin-search-status", requestId],
    queryFn: () => checkStatus(requestId!),
    enabled: !!requestId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "done") return false;
      return 3000; // poll every 3s
    },
    // Stop after 60 seconds (20 polls * 3s)
    retry: false,
  });
}

// ── Get results ──

async function getResults(requestId: string): Promise<SearchResultsResponse> {
  const res = await fetch(
    `/api/linkedin/search/results?request_id=${encodeURIComponent(requestId)}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Results fetch failed" }));
    throw new Error(err.error || "Results fetch failed");
  }
  return res.json();
}

export function useSearchResults(requestId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["linkedin-search-results", requestId],
    queryFn: () => getResults(requestId!),
    enabled: !!requestId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Import profiles ──

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  skippedDetails: string[];
  leadIds: string[];
}

async function importProfiles(
  profiles: LinkedInEmployee[]
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

export function useImportLinkedInProfiles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: importProfiles,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

// ── Import from URLs (legacy) ──

async function importFromUrls(
  urls: { profileUrl: string; firstName: string; lastName: string }[]
): Promise<ImportResult> {
  const res = await fetch("/api/linkedin/import-urls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Import failed" }));
    throw new Error(err.error || "Import failed");
  }
  return res.json();
}

export function useImportLinkedInUrls() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: importFromUrls,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
