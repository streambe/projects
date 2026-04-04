import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const sequence = await prisma.sequence.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { order: "asc" },
          include: { template: true },
        },
        _count: {
          select: {
            enrollments: { where: { status: "ACTIVE" } },
          },
        },
      },
    });

    if (!sequence) {
      return NextResponse.json(
        { error: "Sequence not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(sequence);
  } catch (error) {
    console.error("Failed to fetch sequence:", error);
    return NextResponse.json(
      { error: "Failed to fetch sequence", code: "SEQUENCE_FETCH_ERROR" },
      { status: 500 }
    );
  }
}

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

    const existing = await prisma.sequence.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Sequence not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // If steps are provided, replace all steps
    if (Array.isArray(body.steps)) {
      await prisma.sequenceStep.deleteMany({ where: { sequenceId: id } });
      updateData.steps = {
        create: body.steps.map((step: { channel: string; templateId?: string; delayDays?: number; subject?: string; content?: string }, index: number) => ({
          order: index,
          channel: step.channel,
          templateId: step.templateId || null,
          delayDays: step.delayDays ?? 0,
          subject: step.subject || null,
          content: step.content || null,
        })),
      };
    }

    const sequence = await prisma.sequence.update({
      where: { id },
      data: updateData,
      include: { steps: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(sequence);
  } catch (error) {
    console.error("Failed to update sequence:", error);
    return NextResponse.json(
      { error: "Failed to update sequence", code: "SEQUENCE_UPDATE_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const sequence = await prisma.sequence.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: { where: { status: "ACTIVE" } },
          },
        },
      },
    });

    if (!sequence) {
      return NextResponse.json(
        { error: "Sequence not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (sequence._count.enrollments > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete sequence with active enrollments",
          code: "ACTIVE_ENROLLMENTS",
        },
        { status: 409 }
      );
    }

    await prisma.sequence.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete sequence:", error);
    return NextResponse.json(
      { error: "Failed to delete sequence", code: "SEQUENCE_DELETE_ERROR" },
      { status: 500 }
    );
  }
}
