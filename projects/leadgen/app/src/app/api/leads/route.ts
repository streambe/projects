import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateScore } from "@/lib/scoring";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    const search = searchParams.get("search");
    const scoreMin = searchParams.get("scoreMin");
    const scoreMax = searchParams.get("scoreMax");
    const assignedToId = searchParams.get("assignedToId");

    let query = supabaseAdmin
      .from("Lead")
      .select("*, company:Company(*), assignedTo:User!Lead_assignedToId_fkey(*)")
      .order("createdAt", { ascending: false });

    if (stage) query = query.eq("stage", stage);
    if (assignedToId) query = query.eq("assignedToId", assignedToId);
    if (scoreMin) query = query.gte("score", Number(scoreMin));
    if (scoreMax) query = query.lte("score", Number(scoreMax));
    if (search) {
      query = query.or(
        `firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data: leads, error } = await query;

    if (error) throw error;
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads", code: "LEADS_FETCH_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const body = await request.json();

    const allowed = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email || null,
      phone: body.phone || null,
      title: body.title || null,
      linkedinUrl: body.linkedinUrl || null,
      stage: body.stage || "NEW",
      source: body.source || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      companyId: body.companyId || null,
      assignedToId: body.assignedToId || null,
    };

    if (!allowed.firstName || !allowed.lastName) {
      return NextResponse.json(
        { error: "firstName and lastName are required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Create the lead
    const { data: created, error: createError } = await supabaseAdmin
      .from("Lead")
      .insert(allowed)
      .select("*, company:Company(*), activities:Activity(*)")
      .single();

    if (createError) throw createError;

    // Calculate initial score
    const { total, demographic, behavioral } = calculateScore(created);
    const { data: lead, error: updateError } = await supabaseAdmin
      .from("Lead")
      .update({ score: total, scoreDemographic: demographic, scoreBehavioral: behavioral })
      .eq("id", created.id)
      .select("*, company:Company(*), assignedTo:User!Lead_assignedToId_fkey(*)")
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Failed to create lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead", code: "LEAD_CREATE_ERROR" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing lead id", code: "MISSING_ID" },
        { status: 400 }
      );
    }
    const body = await request.json();

    const allowed: Record<string, unknown> = {};
    const updateableFields = ["firstName", "lastName", "email", "phone", "title", "linkedinUrl", "stage", "source", "tags", "companyId", "assignedToId"];
    for (const field of updateableFields) {
      if (body[field] !== undefined) allowed[field] = body[field];
    }

    const { data: lead, error } = await supabaseAdmin
      .from("Lead")
      .update(allowed)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead", code: "LEAD_UPDATE_ERROR" },
      { status: 500 }
    );
  }
}
