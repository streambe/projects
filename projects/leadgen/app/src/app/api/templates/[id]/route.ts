import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { data: existing, error: findError } = await supabaseAdmin
      .from("Template")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: "Template not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const { data: template, error } = await supabaseAdmin
      .from("Template")
      .update({
        name: body.name ?? existing.name,
        channel: body.channel ?? existing.channel,
        subject: body.subject !== undefined ? body.subject : existing.subject,
        content: body.content ?? existing.content,
        variables: body.variables ?? existing.variables,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(template);
  } catch (error) {
    console.error("Failed to update template:", error);
    return NextResponse.json(
      { error: "Failed to update template", code: "TEMPLATE_UPDATE_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: existing, error: findError } = await supabaseAdmin
      .from("Template")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: "Template not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from("Template")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return NextResponse.json(
      { error: "Failed to delete template", code: "TEMPLATE_DELETE_ERROR" },
      { status: 500 }
    );
  }
}
