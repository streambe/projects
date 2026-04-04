import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sequenceId } = await params;
    const body = await request.json();

    // Accept single leadId or array of leadIds
    const leadIds: string[] = Array.isArray(body.leadIds)
      ? body.leadIds
      : body.leadId
        ? [body.leadId]
        : [];

    if (leadIds.length === 0) {
      return NextResponse.json(
        { error: "At least one leadId is required", code: "MISSING_LEAD_IDS" },
        { status: 400 }
      );
    }

    const sequence = await prisma.sequence.findUnique({
      where: { id: sequenceId },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    if (!sequence) {
      return NextResponse.json(
        { error: "Sequence not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!sequence.isActive) {
      return NextResponse.json(
        { error: "Sequence is not active", code: "SEQUENCE_INACTIVE" },
        { status: 400 }
      );
    }

    if (sequence.steps.length === 0) {
      return NextResponse.json(
        { error: "Sequence has no steps", code: "NO_STEPS" },
        { status: 400 }
      );
    }

    // Check for existing active enrollments
    const existingEnrollments = await prisma.sequenceEnrollment.findMany({
      where: {
        sequenceId,
        leadId: { in: leadIds },
        status: "ACTIVE",
      },
    });

    const alreadyEnrolled = new Set(existingEnrollments.map((e) => e.leadId));
    const toEnroll = leadIds.filter((id) => !alreadyEnrolled.has(id));

    if (toEnroll.length === 0) {
      return NextResponse.json(
        { error: "All leads are already enrolled in this sequence", code: "ALREADY_ENROLLED" },
        { status: 409 }
      );
    }

    const firstStep = sequence.steps[0];
    const now = new Date();
    const nextActionAt = new Date(now.getTime() + firstStep.delayDays * 24 * 60 * 60 * 1000);

    const enrollments = await Promise.all(
      toEnroll.map((leadId) =>
        prisma.sequenceEnrollment.create({
          data: {
            sequenceId,
            leadId,
            currentStep: 0,
            status: "ACTIVE",
            nextActionAt,
          },
          include: {
            lead: { include: { company: true } },
            sequence: true,
          },
        })
      )
    );

    return NextResponse.json(
      {
        enrolled: enrollments,
        skipped: Array.from(alreadyEnrolled),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to enroll leads:", error);
    return NextResponse.json(
      { error: "Failed to enroll leads", code: "ENROLL_ERROR" },
      { status: 500 }
    );
  }
}
