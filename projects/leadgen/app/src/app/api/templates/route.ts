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

    const { data: templates, error } = await supabaseAdmin
      .from("Template")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates", code: "TEMPLATES_FETCH_ERROR" },
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
        { error: "Template name is required", code: "MISSING_NAME" },
        { status: 400 }
      );
    }

    if (!body.channel || !["LINKEDIN", "EMAIL", "PHONE", "IN_PERSON", "OTHER"].includes(body.channel)) {
      return NextResponse.json(
        { error: "Valid channel is required", code: "INVALID_CHANNEL" },
        { status: 400 }
      );
    }

    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json(
        { error: "Template content is required", code: "MISSING_CONTENT" },
        { status: 400 }
      );
    }

    const variableMatches = body.content.match(/\{\{(\w+)\}\}/g) || [];
    const variables = [...new Set(variableMatches.map((v: string) => v.replace(/\{\{|\}\}/g, "")))] as string[];

    const { data: template, error } = await supabaseAdmin
      .from("Template")
      .insert({
        name: body.name,
        channel: body.channel,
        subject: body.subject || null,
        content: body.content,
        variables,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Failed to create template:", error);
    return NextResponse.json(
      { error: "Failed to create template", code: "TEMPLATE_CREATE_ERROR" },
      { status: 500 }
    );
  }
}
