import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Template not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        channel: body.channel ?? existing.channel,
        subject: body.subject !== undefined ? body.subject : existing.subject,
        content: body.content ?? existing.content,
        variables: body.variables ?? existing.variables,
      },
    });

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

    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Template not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    await prisma.template.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return NextResponse.json(
      { error: "Failed to delete template", code: "TEMPLATE_DELETE_ERROR" },
      { status: 500 }
    );
  }
}
