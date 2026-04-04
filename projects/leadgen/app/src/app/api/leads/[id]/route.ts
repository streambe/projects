import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { id } = await params;
    const { data: lead, error } = await supabaseAdmin
      .from("Lead")
      .select("*, company:Company(*), assignedTo:User!Lead_assignedToId_fkey(*)")
      .eq("id", id)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Failed to fetch lead:", error);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { id } = await params;
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
      .select("*, company:Company(*), assignedTo:User!Lead_assignedToId_fkey(*)")
      .single();

    if (error) throw error;
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
