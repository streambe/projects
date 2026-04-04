"use client";

import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  totalLeads: number;
  newThisWeek: number;
  mqls: number;
  conversionRate: number;
  byStage: Record<string, number>;
  byScore: Record<string, number>;
  todayActions: {
    leadId: string;
    leadName: string;
    leadScore: number;
    sequenceName: string;
    step: number;
    nextActionAt: string | null;
  }[];
  hotLeads: {
    id: string;
    name: string;
    score: number;
    label: string;
    title: string | null;
    company: string | null;
  }[];
  recentActivity: {
    id: string;
    type: string;
    leadName: string;
    userName: string;
    createdAt: string;
    subject: string | null;
  }[];
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch("/api/dashboard/stats");
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 30_000, // refresh every 30s
  });
}
