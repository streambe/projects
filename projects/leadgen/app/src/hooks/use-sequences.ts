"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Sequence, SequenceStep } from "@/types";

export type SequenceWithSteps = Sequence & {
  steps: SequenceStep[];
  _count: { enrollments: number };
};

async function fetchSequences(): Promise<SequenceWithSteps[]> {
  const res = await fetch("/api/sequences");
  if (!res.ok) throw new Error("Failed to fetch sequences");
  return res.json();
}

async function fetchSequence(id: string): Promise<SequenceWithSteps> {
  const res = await fetch(`/api/sequences/${id}`);
  if (!res.ok) throw new Error("Failed to fetch sequence");
  return res.json();
}

export interface CreateSequenceInput {
  name: string;
  description?: string;
  isActive?: boolean;
  steps: {
    channel: string;
    templateId?: string;
    delayDays?: number;
    subject?: string;
    content?: string;
  }[];
}

async function createSequence(data: CreateSequenceInput): Promise<SequenceWithSteps> {
  const res = await fetch("/api/sequences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create sequence");
  return res.json();
}

async function updateSequence(data: { id: string } & Partial<CreateSequenceInput>): Promise<SequenceWithSteps> {
  const { id, ...body } = data;
  const res = await fetch(`/api/sequences/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update sequence");
  return res.json();
}

async function deleteSequence(id: string): Promise<void> {
  const res = await fetch(`/api/sequences/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete sequence");
  }
}

export function useSequences() {
  return useQuery({
    queryKey: ["sequences"],
    queryFn: fetchSequences,
  });
}

export function useSequence(id: string | null | undefined) {
  return useQuery({
    queryKey: ["sequence", id],
    queryFn: () => fetchSequence(id!),
    enabled: !!id,
  });
}

export function useCreateSequence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSequence,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sequences"] }),
  });
}

export function useUpdateSequence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSequence,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sequences"] });
      qc.invalidateQueries({ queryKey: ["sequence"] });
    },
  });
}

export function useDeleteSequence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSequence,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sequences"] }),
  });
}
