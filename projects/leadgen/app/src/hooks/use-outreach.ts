"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface OutreachMessage {
  leadId: string;
  leadName: string;
  company: string;
  title: string;
  linkedinUrl: string | null;
  message: string;
}

async function generateMessages(data: {
  leadIds: string[];
  templateId: string;
}): Promise<OutreachMessage[]> {
  const res = await fetch("/api/outreach/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate messages");
  }
  return res.json();
}

async function markAsSent(data: {
  leadId: string;
  message: string;
  activityType: "LINKEDIN_CONNECT" | "LINKEDIN_MESSAGE";
}): Promise<void> {
  const res = await fetch(`/api/leads/${data.leadId}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: data.activityType,
      channel: "LINKEDIN",
      subject: "Outreach message sent",
      content: data.message,
    }),
  });
  if (!res.ok) throw new Error("Failed to record activity");
}

export function useGenerateMessages() {
  return useMutation({
    mutationFn: generateMessages,
  });
}

export function useMarkAsSent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAsSent,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["activities", variables.leadId] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead", variables.leadId] });
    },
  });
}
