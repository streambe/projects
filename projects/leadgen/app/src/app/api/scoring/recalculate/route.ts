import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/scoring";
import { requireAuth } from "@/lib/auth";

export async function POST() {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;
    const leads = await prisma.lead.findMany({
      include: { company: true, activities: true },
    });

    let updated = 0;

    for (const lead of leads) {
      const { total, demographic, behavioral } = calculateScore(lead);

      if (
        lead.score !== total ||
        lead.scoreDemographic !== demographic ||
        lead.scoreBehavioral !== behavioral
      ) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            score: total,
            scoreDemographic: demographic,
            scoreBehavioral: behavioral,
          },
        });
        updated++;
      }
    }

    return NextResponse.json({ updated, total: leads.length });
  } catch (error) {
    console.error("Failed to recalculate scores:", error);
    return NextResponse.json(
      { error: "Failed to recalculate scores", code: "SCORING_ERROR" },
      { status: 500 }
    );
  }
}
