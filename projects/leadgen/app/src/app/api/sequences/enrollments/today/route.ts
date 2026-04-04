import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const { data: enrollments, error } = await supabaseAdmin
      .from("SequenceEnrollment")
      .select("*, lead:Lead(*, company:Company(*)), sequence:Sequence(*, steps:SequenceStep(*, template:Template(*)))")
      .eq("status", "ACTIVE")
      .lte("nextActionAt", endOfToday.toISOString())
      .order("nextActionAt", { ascending: true });

    if (error) throw error;

    // Sort steps in each enrollment
    for (const enrollment of (enrollments ?? [])) {
      if (enrollment.sequence?.steps) {
        enrollment.sequence.steps.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
      }
    }

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Failed to fetch today actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch today actions", code: "TODAY_ACTIONS_ERROR" },
      { status: 500 }
    );
  }
}
