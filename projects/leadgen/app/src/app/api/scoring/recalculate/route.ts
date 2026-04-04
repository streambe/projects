import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateScore } from "@/lib/scoring";
import { requireAuth } from "@/lib/auth";

export async function POST() {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { data: leads, error } = await supabaseAdmin
      .from("Lead")
      .select("*, company:Company(*), activities:Activity(*)");

    if (error) throw error;

    let updated = 0;

    for (const lead of (leads ?? [])) {
      const { total, demographic, behavioral } = calculateScore(lead);

      if (
        lead.score !== total ||
        lead.scoreDemographic !== demographic ||
        lead.scoreBehavioral !== behavioral
      ) {
        await supabaseAdmin
          .from("Lead")
          .update({
            score: total,
            scoreDemographic: demographic,
            scoreBehavioral: behavioral,
          })
          .eq("id", lead.id);
        updated++;
      }
    }

    return NextResponse.json({ updated, total: (leads ?? []).length });
  } catch (error) {
    console.error("Failed to recalculate scores:", error);
    return NextResponse.json(
      { error: "Failed to recalculate scores", code: "SCORING_ERROR" },
      { status: 500 }
    );
  }
}
