/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { labelForScore } from "@/lib/scoring";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Run independent queries in parallel
    const [
      totalLeadsRes,
      newThisWeekRes,
      allLeadsRes,
      wonCountRes,
      recentActivitiesRes,
      todayEnrollmentsRes,
    ] = await Promise.all([
      supabaseAdmin.from("Lead").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("Lead").select("id", { count: "exact", head: true }).gte("createdAt", weekAgo.toISOString()),
      supabaseAdmin
        .from("Lead")
        .select("id, firstName, lastName, score, stage, title, company:Company(name)")
        .order("score", { ascending: false }),
      supabaseAdmin.from("Lead").select("id", { count: "exact", head: true }).eq("stage", "WON"),
      supabaseAdmin
        .from("Activity")
        .select("id, type, subject, createdAt, lead:Lead(firstName, lastName), user:User(name)")
        .order("createdAt", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("SequenceEnrollment")
        .select("id, currentStep, nextActionAt, lead:Lead(id, firstName, lastName, score), sequence:Sequence(name)")
        .eq("status", "ACTIVE")
        .gte("nextActionAt", todayStart.toISOString())
        .lt("nextActionAt", todayEnd.toISOString())
        .limit(20),
    ]);

    const totalLeads = totalLeadsRes.count ?? 0;
    const newThisWeek = newThisWeekRes.count ?? 0;
    const allLeads = (allLeadsRes.data ?? []) as any[];
    const wonCount = wonCountRes.count ?? 0;
    const recentActivities = (recentActivitiesRes.data ?? []) as any[];
    const todayEnrollments = (todayEnrollmentsRes.data ?? []) as any[];

    // Compute distributions
    const byStage: Record<string, number> = {};
    const byScore: Record<string, number> = { COLD: 0, WARM: 0, MQL: 0, SQL: 0 };

    for (const lead of allLeads) {
      byStage[lead.stage] = (byStage[lead.stage] || 0) + 1;
      const label = labelForScore(lead.score);
      byScore[label]++;
    }

    const conversionRate = totalLeads > 0
      ? Math.round((wonCount / totalLeads) * 1000) / 10
      : 0;

    const mqls = (byScore.MQL || 0) + (byScore.SQL || 0);

    const hotLeads = allLeads.slice(0, 10).map((l) => ({
      id: l.id,
      name: `${l.firstName} ${l.lastName}`,
      score: l.score,
      label: labelForScore(l.score),
      title: l.title,
      company: l.company?.name ?? null,
    }));

    const todayActions = todayEnrollments.map((e) => ({
      leadId: e.lead.id,
      leadName: `${e.lead.firstName} ${e.lead.lastName}`,
      leadScore: e.lead.score,
      sequenceName: e.sequence.name,
      step: e.currentStep,
      nextActionAt: e.nextActionAt,
    }));

    const recentActivity = recentActivities.map((a) => ({
      id: a.id,
      type: a.type,
      leadName: a.lead ? `${a.lead.firstName} ${a.lead.lastName}` : "Unknown",
      userName: a.user?.name ?? "System",
      createdAt: a.createdAt,
      subject: a.subject,
    }));

    return NextResponse.json({
      totalLeads,
      newThisWeek,
      mqls,
      conversionRate,
      byStage,
      byScore,
      todayActions,
      hotLeads,
      recentActivity,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats", code: "DASHBOARD_ERROR" },
      { status: 500 }
    );
  }
}
