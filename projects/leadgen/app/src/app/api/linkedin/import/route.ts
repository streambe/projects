import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { calculateScore } from "@/lib/scoring";
import type { LinkedInEmployee } from "@/lib/linkedin-constants";

interface ImportRequest {
  profiles: LinkedInEmployee[];
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

    const body = (await request.json()) as ImportRequest;
    const { profiles } = body;

    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      return NextResponse.json(
        { error: "profiles array is required", code: "MISSING_PROFILES" },
        { status: 400 }
      );
    }

    const imported: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const profile of profiles) {
      try {
        // Check duplicate by linkedinUrl
        const { data: existing } = await supabaseAdmin
          .from("Lead")
          .select("id")
          .eq("linkedinUrl", profile.linkedin_url)
          .limit(1)
          .single();

        if (existing) {
          skipped.push(`${profile.full_name} — already exists`);
          continue;
        }

        // Create or find company
        let companyId: string | null = null;
        if (profile.company) {
          const { data: existingCompany } = await supabaseAdmin
            .from("Company")
            .select("id")
            .eq("name", profile.company)
            .limit(1)
            .single();

          if (existingCompany) {
            companyId = existingCompany.id;
          } else {
            const { data: newCompany, error: companyError } =
              await supabaseAdmin
                .from("Company")
                .insert({
                  name: profile.company,
                  linkedin: profile.company_id
                    ? `https://www.linkedin.com/company/${profile.company_id}/`
                    : null,
                })
                .select("id")
                .single();

            if (companyError) {
              console.error("Company create error:", companyError);
            } else if (newCompany) {
              companyId = newCompany.id;
            }
          }
        }

        // Calculate score
        const scoreResult = calculateScore({
          id: "",
          firstName: profile.first_name,
          lastName: profile.last_name,
          title: profile.job_title,
          email: null,
          phone: null,
          linkedinUrl: profile.linkedin_url,
          linkedinProfile: null,
          stage: "NEW",
          score: 0,
          scoreDemographic: 0,
          scoreBehavioral: 0,
          isTarget: false,
          notes: null,
          companyId: companyId,
          assignedToId: null,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          company: profile.company
            ? {
                id: companyId || "",
                name: profile.company,
                industry: null,
                size: null,
                website: null,
                linkedin: null,
                country: null,
                city: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            : null,
          activities: [],
        });

        // Create lead
        const { data: lead, error: leadError } = await supabaseAdmin
          .from("Lead")
          .insert({
            firstName: profile.first_name,
            lastName: profile.last_name,
            title: profile.job_title || null,
            linkedinUrl: profile.linkedin_url,
            linkedinProfile: profile as unknown as Record<string, unknown>,
            companyId,
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
        errors.push(`${profile.full_name}: ${msg}`);
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
    console.error("LinkedIn import error:", error);
    return NextResponse.json(
      { error: "Failed to import profiles", code: "IMPORT_ERROR" },
      { status: 500 }
    );
  }
}
