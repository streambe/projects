import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sequences = await prisma.sequence.findMany({
      include: {
        steps: { orderBy: { order: "asc" } },
        _count: {
          select: {
            enrollments: { where: { status: "ACTIVE" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sequences);
  } catch (error) {
    console.error("Failed to fetch sequences:", error);
    return NextResponse.json(
      { error: "Failed to fetch sequences", code: "SEQUENCES_FETCH_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Sequence name is required", code: "MISSING_NAME" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.steps) || body.steps.length === 0) {
      return NextResponse.json(
        { error: "At least one step is required", code: "MISSING_STEPS" },
        { status: 400 }
      );
    }

    for (const step of body.steps) {
      if (!step.channel || !["LINKEDIN", "EMAIL", "PHONE", "IN_PERSON", "OTHER"].includes(step.channel)) {
        return NextResponse.json(
          { error: "Each step must have a valid channel", code: "INVALID_STEP_CHANNEL" },
          { status: 400 }
        );
      }
      if (step.delayDays !== undefined && (typeof step.delayDays !== "number" || step.delayDays < 0)) {
        return NextResponse.json(
          { error: "delayDays must be a non-negative number", code: "INVALID_DELAY" },
          { status: 400 }
        );
      }
    }

    const sequence = await prisma.sequence.create({
      data: {
        name: body.name,
        description: body.description || null,
        isActive: body.isActive ?? true,
        steps: {
          create: body.steps.map((step: { channel: string; templateId?: string; delayDays?: number; subject?: string; content?: string }, index: number) => ({
            order: index,
            channel: step.channel,
            templateId: step.templateId || null,
            delayDays: step.delayDays ?? 0,
            subject: step.subject || null,
            content: step.content || null,
          })),
        },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(sequence, { status: 201 });
  } catch (error) {
    console.error("Failed to create sequence:", error);
    return NextResponse.json(
      { error: "Failed to create sequence", code: "SEQUENCE_CREATE_ERROR" },
      { status: 500 }
    );
  }
}
