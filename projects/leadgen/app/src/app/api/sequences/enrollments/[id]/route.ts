import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Fetch enrollment with sequence steps
    const { data: enrollment, error: findError } = await supabaseAdmin
      .from("SequenceEnrollment")
      .select("*, sequence:Sequence(*, steps:SequenceStep(*))")
      .eq("id", id)
      .single();

    if (findError || !enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const { action } = body;

    if (!action || !["pause", "resume", "cancel", "complete_step", "skip_step"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be: pause, resume, cancel, complete_step, skip_step", code: "INVALID_ACTION" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const steps = (enrollment.sequence.steps ?? []).sort((a: { order: number }, b: { order: number }) => a.order - b.order);

    switch (action) {
      case "pause": {
        if (enrollment.status !== "ACTIVE") {
          return NextResponse.json(
            { error: "Can only pause active enrollments", code: "INVALID_STATUS" },
            { status: 400 }
          );
        }
        updateData.status = "PAUSED";
        updateData.nextActionAt = null;
        break;
      }

      case "resume": {
        if (enrollment.status !== "PAUSED") {
          return NextResponse.json(
            { error: "Can only resume paused enrollments", code: "INVALID_STATUS" },
            { status: 400 }
          );
        }
        const currentStepDef = steps[enrollment.currentStep];
        if (currentStepDef) {
          const now = new Date();
          updateData.nextActionAt = new Date(now.getTime() + currentStepDef.delayDays * 24 * 60 * 60 * 1000).toISOString();
        }
        updateData.status = "ACTIVE";
        break;
      }

      case "cancel": {
        if (enrollment.status === "COMPLETED" || enrollment.status === "CANCELLED") {
          return NextResponse.json(
            { error: "Enrollment is already finished", code: "INVALID_STATUS" },
            { status: 400 }
          );
        }
        updateData.status = "CANCELLED";
        updateData.nextActionAt = null;
        updateData.completedAt = new Date().toISOString();
        break;
      }

      case "complete_step":
      case "skip_step": {
        if (enrollment.status !== "ACTIVE") {
          return NextResponse.json(
            { error: "Can only advance active enrollments", code: "INVALID_STATUS" },
            { status: 400 }
          );
        }

        const nextStepIndex = enrollment.currentStep + 1;

        if (nextStepIndex >= steps.length) {
          updateData.status = "COMPLETED";
          updateData.currentStep = nextStepIndex;
          updateData.nextActionAt = null;
          updateData.completedAt = new Date().toISOString();
        } else {
          const nextStep = steps[nextStepIndex];
          const now = new Date();
          updateData.currentStep = nextStepIndex;
          updateData.nextActionAt = new Date(now.getTime() + nextStep.delayDays * 24 * 60 * 60 * 1000).toISOString();
        }
        break;
      }
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("SequenceEnrollment")
      .update(updateData)
      .eq("id", id)
      .select("*, lead:Lead(*, company:Company(*)), sequence:Sequence(*, steps:SequenceStep(*))")
      .single();

    if (updateError) throw updateError;

    // Sort steps in the response
    if (updated?.sequence?.steps) {
      updated.sequence.steps.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update enrollment:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment", code: "ENROLLMENT_UPDATE_ERROR" },
      { status: 500 }
    );
  }
}
