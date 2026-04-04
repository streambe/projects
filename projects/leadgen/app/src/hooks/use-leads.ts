"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Lead, Activity, Stage } from "@/types";

// --- Fetchers ---

interface LeadFilters {
  stage?: Stage;
  search?: string;
  scoreMin?: number;
  scoreMax?: number;
  assignedToId?: string;
}

async function fetchLeads(filters?: LeadFilters): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (filters?.stage) params.set("stage", filters.stage);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.scoreMin !== undefined) params.set("scoreMin", String(filters.scoreMin));
  if (filters?.scoreMax !== undefined) params.set("scoreMax", String(filters.scoreMax));
  if (filters?.assignedToId) params.set("assignedToId", filters.assignedToId);
  const qs = params.toString();
  const res = await fetch(`/api/leads${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

async function fetchLead(id: string): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}`);
  if (!res.ok) throw new Error("Failed to fetch lead");
  return res.json();
}

async function updateLead(data: { id: string } & Partial<Lead>): Promise<Lead> {
  const { id, ...body } = data;
  const res = await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return res.json();
}

async function createLead(data: Partial<Lead>): Promise<Lead> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create lead");
  return res.json();
}

async function fetchActivities(leadId: string): Promise<Activity[]> {
  const res = await fetch(`/api/leads/${leadId}/activities`);
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
}

async function createActivity(data: { leadId: string; type: string; content?: string; subject?: string }): Promise<Activity> {
  const { leadId, ...body } = data;
  const res = await fetch(`/api/leads/${leadId}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create activity");
  return res.json();
}

// --- Hooks ---

export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () => fetchLeads(filters),
  });
}

export function useLead(id: string | null | undefined) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => fetchLead(id!),
    enabled: !!id,
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead"] });
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useActivities(leadId: string | null | undefined) {
  return useQuery({
    queryKey: ["activities", leadId],
    queryFn: () => fetchActivities(leadId!),
    enabled: !!leadId,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createActivity,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities", variables.leadId] });
    },
  });
}
