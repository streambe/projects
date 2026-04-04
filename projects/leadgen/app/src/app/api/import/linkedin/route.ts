import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { parseLinkedInUrl } from "@/lib/import-utils";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body as { url: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "LinkedIn URL is required", code: "MISSING_URL" },
        { status: 400 }
      );
    }

    const parsed = parseLinkedInUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid LinkedIn profile URL", code: "INVALID_LINKEDIN_URL" },
        { status: 400 }
      );
    }

    // Check duplicate by linkedinUrl
    const { data: existing } = await supabaseAdmin
      .from("Lead")
      .select("id")
      .eq("linkedinUrl", parsed.linkedinUrl)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Lead with this LinkedIn URL already exists", code: "DUPLICATE_LEAD" },
        { status: 409 }
      );
    }

    const { data: lead, error } = await supabaseAdmin
      .from("Lead")
      .insert({
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        linkedinUrl: parsed.linkedinUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Failed to import LinkedIn lead:", error);
    return NextResponse.json(
      { error: "Failed to import LinkedIn lead", code: "LINKEDIN_IMPORT_ERROR" },
      { status: 500 }
    );
  }
}
