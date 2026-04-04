import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;
    const body = await request.json();
    const { leads } = body as { leads: Array<Record<string, unknown>> };

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: "No leads provided", code: "EMPTY_IMPORT" },
        { status: 400 }
      );
    }

    const leadsToInsert = leads.map((l) => ({
      firstName: String(l.firstName || ""),
      lastName: String(l.lastName || ""),
      email: l.email ? String(l.email) : null,
      phone: l.phone ? String(l.phone) : null,
      title: l.title ? String(l.title) : null,
      linkedinUrl: l.linkedinUrl ? String(l.linkedinUrl) : null,
      tags: Array.isArray(l.tags) ? l.tags.map(String) : [],
    }));

    // Supabase doesn't have skipDuplicates natively, so we insert and handle errors
    const { data, error } = await supabaseAdmin
      .from("Lead")
      .insert(leadsToInsert)
      .select("id");

    if (error) throw error;

    return NextResponse.json(
      { imported: data?.length ?? 0 },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to import leads:", error);
    return NextResponse.json(
      { error: "Failed to import leads", code: "IMPORT_ERROR" },
      { status: 500 }
    );
  }
}
