import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { calculateScore } from "@/lib/scoring";

interface UrlEntry {
  profileUrl: string;
  firstName: string;
  lastName: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { urls } = body as { urls: UrlEntry[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array is required", code: "MISSING_URLS" },
        { status: 400 }
      );
    }

    const imported: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const entry of urls) {
      try {
        // Check duplicate by linkedinUrl
        const { data: existing } = await supabaseAdmin
          .from("Lead")
          .select("id")
          .eq("linkedinUrl", entry.profileUrl)
          .limit(1)
          .single();

        if (existing) {
          skipped.push(`${entry.firstName} ${entry.lastName} — already exists`);
          continue;
        }

        // Calculate score with minimal data
        const scoreResult = calculateScore({
          id: "",
          firstName: entry.firstName,
          lastName: entry.lastName,
          title: null,
          email: null,
          phone: null,
          linkedinUrl: entry.profileUrl,
          linkedinProfile: null,
          stage: "NEW",
          score: 0,
          scoreDemographic: 0,
          scoreBehavioral: 0,
          isTarget: false,
          notes: null,
          companyId: null,
          assignedToId: null,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          company: null,
          activities: [],
        });

        const { data: lead, error: leadError } = await supabaseAdmin
          .from("Lead")
          .insert({
            firstName: entry.firstName,
            lastName: entry.lastName,
            linkedinUrl: entry.profileUrl,
            score: scoreResult.total,
            scoreDemographic: scoreResult.demographic,
            scoreBehavioral: scoreResult.behavioral,
          })
          .select("id")
          .single();

        if (leadError) throw leadError;
        imported.push(lead.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`${entry.firstName} ${entry.lastName}: ${msg}`);
      }
    }

    return NextResponse.json({
      imported: imported.length,
      skipped: skipped.length,
      errors,
      skippedDetails: skipped,
      leadIds: imported,
    });
  } catch (error) {
    console.error("LinkedIn import-urls error:", error);
    return NextResponse.json(
      { error: "Failed to import profiles", code: "IMPORT_ERROR" },
      { status: 500 }
    );
  }
}
