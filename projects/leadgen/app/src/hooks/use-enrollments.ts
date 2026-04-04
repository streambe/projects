"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SequenceEnrollment, Lead, Company, Sequence, SequenceStep, Template } from "@/types";

export type EnrollmentWithDetails = SequenceEnrollment & {
  lead: Lead & { company: Company | null };
  sequence: Sequence & {
    steps: (SequenceStep & { template: Template | null })[];
  };
};

async function enrollLeads(data: {
  sequenceId: string;
  leadIds: string[];
}): Promise<{ enrolled: EnrollmentWithDetails[]; skipped: string[] }> {
  const res = await fetch(`/api/sequences/${data.sequenceId}/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadIds: data.leadIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to enroll leads");
  }
  return res.json();
}

async function fetchTodayActions(): Promise<EnrollmentWithDetails[]> {
  const res = await fetch("/api/sequences/enrollments/today");
  if (!res.ok) throw new Error("Failed to fetch today actions");
  return res.json();
}

async function updateEnrollment(data: {
  id: string;
  action: "pause" | "resume" | "cancel" | "complete_step" | "skip_step";
}): Promise<EnrollmentWithDetails> {
  const { id, action } = data;
  const res = await fetch(`/api/sequences/enrollments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update enrollment");
  }
  return res.json();
}

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollLeads,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sequences"] });
      qc.invalidateQueries({ queryKey: ["todayActions"] });
    },
  });
}

export function useTodayActions() {
  return useQuery({
    queryKey: ["todayActions"],
    queryFn: fetchTodayActions,
  });
}

export function useCompleteStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateEnrollment({ id, action: "complete_step" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayActions"] });
      qc.invalidateQueries({ queryKey: ["sequences"] });
    },
  });
}

export function useSkipStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateEnrollment({ id, action: "skip_step" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayActions"] });
      qc.invalidateQueries({ queryKey: ["sequences"] });
    },
  });
}

export function usePauseEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateEnrollment({ id, action: "pause" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayActions"] });
      qc.invalidateQueries({ queryKey: ["sequences"] });
    },
  });
}

export function useResumeEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateEnrollment({ id, action: "resume" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayActions"] });
      qc.invalidateQueries({ queryKey: ["sequences"] });
    },
  });
}

export function useCancelEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateEnrollment({ id, action: "cancel" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayActions"] });
      qc.invalidateQueries({ queryKey: ["sequences"] });
    },
  });
}
