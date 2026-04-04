import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const enrollment = await prisma.sequenceEnrollment.findUnique({
      where: { id },
      include: {
        sequence: { include: { steps: { orderBy: { order: "asc" } } } },
      },
    });

    if (!enrollment) {
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
    const steps = enrollment.sequence.steps;

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
          updateData.nextActionAt = new Date(now.getTime() + currentStepDef.delayDays * 24 * 60 * 60 * 1000);
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
        updateData.completedAt = new Date();
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
          // Sequence complete
          updateData.status = "COMPLETED";
          updateData.currentStep = nextStepIndex;
          updateData.nextActionAt = null;
          updateData.completedAt = new Date();
        } else {
          const nextStep = steps[nextStepIndex];
          const now = new Date();
          updateData.currentStep = nextStepIndex;
          updateData.nextActionAt = new Date(now.getTime() + nextStep.delayDays * 24 * 60 * 60 * 1000);
        }
        break;
      }
    }

    const updated = await prisma.sequenceEnrollment.update({
      where: { id },
      data: updateData,
      include: {
        lead: { include: { company: true } },
        sequence: { include: { steps: { orderBy: { order: "asc" } } } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update enrollment:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment", code: "ENROLLMENT_UPDATE_ERROR" },
      { status: 500 }
    );
  }
}
