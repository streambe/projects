import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch sequences with steps
    const { data: sequences, error } = await supabaseAdmin
      .from("Sequence")
      .select("*, steps:SequenceStep(*)")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    // Sort steps by order and add active enrollment count
    const enriched = await Promise.all(
      (sequences ?? []).map(async (seq) => {
        const { count } = await supabaseAdmin
          .from("SequenceEnrollment")
          .select("id", { count: "exact", head: true })
          .eq("sequenceId", seq.id)
          .eq("status", "ACTIVE");

        return {
          ...seq,
          steps: (seq.steps ?? []).sort((a: { order: number }, b: { order: number }) => a.order - b.order),
          _count: { enrollments: count ?? 0 },
        };
      })
    );

    return NextResponse.json(enriched);
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

    // Create sequence
    const { data: sequence, error: seqError } = await supabaseAdmin
      .from("Sequence")
      .insert({
        name: body.name,
        description: body.description || null,
        isActive: body.isActive ?? true,
      })
      .select()
      .single();

    if (seqError) throw seqError;

    // Create steps
    const stepsToInsert = body.steps.map((step: { channel: string; templateId?: string; delayDays?: number; subject?: string; content?: string }, index: number) => ({
      sequenceId: sequence.id,
      order: index,
      channel: step.channel,
      templateId: step.templateId || null,
      delayDays: step.delayDays ?? 0,
      subject: step.subject || null,
      content: step.content || null,
    }));

    const { data: steps, error: stepsError } = await supabaseAdmin
      .from("SequenceStep")
      .insert(stepsToInsert)
      .select()
      .order("order", { ascending: true });

    if (stepsError) throw stepsError;

    return NextResponse.json({ ...sequence, steps }, { status: 201 });
  } catch (error) {
    console.error("Failed to create sequence:", error);
    return NextResponse.json(
      { error: "Failed to create sequence", code: "SEQUENCE_CREATE_ERROR" },
      { status: 500 }
    );
  }
}
