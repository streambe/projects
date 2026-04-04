import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

    const { data: sequence, error } = await supabaseAdmin
      .from("Sequence")
      .select("*, steps:SequenceStep(*, template:Template(*))")
      .eq("id", id)
      .single();

    if (error || !sequence) {
      return NextResponse.json(
        { error: "Sequence not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Sort steps and add enrollment count
    const { count } = await supabaseAdmin
      .from("SequenceEnrollment")
      .select("id", { count: "exact", head: true })
      .eq("sequenceId", id)
      .eq("status", "ACTIVE");

    const result = {
      ...sequence,
      steps: (sequence.steps ?? []).sort((a: { order: number }, b: { order: number }) => a.order - b.order),
      _count: { enrollments: count ?? 0 },
    };

    return NextResponse.json(result);
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

    const { data: existing, error: findError } = await supabaseAdmin
      .from("Sequence")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: "Sequence not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Update sequence fields
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from("Sequence")
        .update(updateData)
        .eq("id", id);
      if (updateError) throw updateError;
    }

    // If steps are provided, replace all steps
    if (Array.isArray(body.steps)) {
      await supabaseAdmin
        .from("SequenceStep")
        .delete()
        .eq("sequenceId", id);

      const stepsToInsert = body.steps.map((step: { channel: string; templateId?: string; delayDays?: number; subject?: string; content?: string }, index: number) => ({
        sequenceId: id,
        order: index,
        channel: step.channel,
        templateId: step.templateId || null,
        delayDays: step.delayDays ?? 0,
        subject: step.subject || null,
        content: step.content || null,
      }));

      await supabaseAdmin.from("SequenceStep").insert(stepsToInsert);
    }

    // Return updated sequence with steps
    const { data: sequence } = await supabaseAdmin
      .from("Sequence")
      .select("*, steps:SequenceStep(*)")
      .eq("id", id)
      .single();

    const result = {
      ...sequence,
      steps: (sequence?.steps ?? []).sort((a: { order: number }, b: { order: number }) => a.order - b.order),
    };

    return NextResponse.json(result);
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

    // Check for active enrollments
    const { count } = await supabaseAdmin
      .from("SequenceEnrollment")
      .select("id", { count: "exact", head: true })
      .eq("sequenceId", id)
      .eq("status", "ACTIVE");

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete sequence with active enrollments",
          code: "ACTIVE_ENROLLMENTS",
        },
        { status: 409 }
      );
    }

    const { data: existing, error: findError } = await supabaseAdmin
      .from("Sequence")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: "Sequence not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Delete steps first, then sequence
    await supabaseAdmin.from("SequenceStep").delete().eq("sequenceId", id);
    const { error } = await supabaseAdmin.from("Sequence").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete sequence:", error);
    return NextResponse.json(
      { error: "Failed to delete sequence", code: "SEQUENCE_DELETE_ERROR" },
      { status: 500 }
    );
  }
}
