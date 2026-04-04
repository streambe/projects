import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
      totalLeads,
      newThisWeek,
      allLeads,
      wonCount,
      recentActivities,
      todayEnrollments,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.lead.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          score: true,
          stage: true,
          title: true,
          company: { select: { name: true } },
        },
        orderBy: { score: "desc" },
      }),
      prisma.lead.count({ where: { stage: "WON" } }),
      prisma.activity.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          lead: { select: { firstName: true, lastName: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.sequenceEnrollment.findMany({
        where: {
          status: "ACTIVE",
          nextActionAt: { gte: todayStart, lt: todayEnd },
        },
        include: {
          lead: {
            select: { id: true, firstName: true, lastName: true, score: true },
          },
          sequence: { select: { name: true } },
        },
        take: 20,
      }),
    ]);

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
