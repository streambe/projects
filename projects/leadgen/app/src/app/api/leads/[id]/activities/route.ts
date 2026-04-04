import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateScore } from "@/lib/scoring";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { id } = await params;
    const { data: activities, error } = await supabaseAdmin
      .from("Activity")
      .select("*")
      .eq("leadId", id)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    const allowedTypes = ["NOTE", "EMAIL", "CALL", "MEETING", "LINKEDIN", "OTHER"];
    if (!body.type || !allowedTypes.includes(body.type)) {
      return NextResponse.json(
        { error: "Valid activity type is required", code: "INVALID_TYPE" },
        { status: 400 }
      );
    }

    const validChannels = ["LINKEDIN", "EMAIL", "PHONE", "IN_PERSON", "OTHER"];
    const channel = body.channel && validChannels.includes(body.channel) ? body.channel : "OTHER";

    const activityData = {
      type: body.type,
      channel,
      subject: body.subject || null,
      content: body.content || body.description || null,
      userId: body.userId || null,
      leadId: id,
    };

    const { data: activity, error: createError } = await supabaseAdmin
      .from("Activity")
      .insert(activityData)
      .select()
      .single();

    if (createError) throw createError;

    // Recalculate lead score after new activity
    const { data: lead } = await supabaseAdmin
      .from("Lead")
      .select("*, company:Company(*), activities:Activity(*)")
      .eq("id", id)
      .single();

    if (lead) {
      const { total, demographic, behavioral } = calculateScore(lead);
      await supabaseAdmin
        .from("Lead")
        .update({ score: total, scoreDemographic: demographic, scoreBehavioral: behavioral })
        .eq("id", id);
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
