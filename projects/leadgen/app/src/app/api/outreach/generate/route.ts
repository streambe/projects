import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { renderTemplate } from "@/lib/template-utils";

export interface OutreachMessage {
  leadId: string;
  leadName: string;
  company: string;
  title: string;
  linkedinUrl: string | null;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { leadIds, templateId } = body as {
      leadIds: string[];
      templateId: string;
    };

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: "leadIds array is required", code: "MISSING_LEAD_IDS" },
        { status: 400 }
      );
    }

    if (!templateId || typeof templateId !== "string") {
      return NextResponse.json(
        { error: "templateId is required", code: "MISSING_TEMPLATE_ID" },
        { status: 400 }
      );
    }

    // Fetch template
    const { data: template, error: tplError } = await supabaseAdmin
      .from("Template")
      .select("*")
      .eq("id", templateId)
      .single();

    if (tplError || !template) {
      return NextResponse.json(
        { error: "Template not found", code: "TEMPLATE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Fetch leads with companies
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("Lead")
      .select("*, company:Company(*)")
      .in("id", leadIds);

    if (leadsError) throw leadsError;
    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { error: "No leads found", code: "NO_LEADS" },
        { status: 404 }
      );
    }

    const messages: OutreachMessage[] = leads.map((lead) => {
      const rendered = renderTemplate(template.content, {
        firstName: lead.firstName || "",
        lastName: lead.lastName || "",
        title: lead.title,
        company: lead.company
          ? { name: lead.company.name, industry: lead.company.industry }
          : null,
      });

      return {
        leadId: lead.id,
        leadName: `${lead.firstName} ${lead.lastName}`.trim(),
        company: lead.company?.name || "",
        title: lead.title || "",
        linkedinUrl: lead.linkedinUrl || null,
        message: rendered,
      };
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to generate outreach messages:", error);
    return NextResponse.json(
      {
        error: "Failed to generate messages",
        code: "OUTREACH_GENERATE_ERROR",
      },
      { status: 500 }
    );
  }
}
