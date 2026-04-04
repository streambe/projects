import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { company: true, assignedTo: true },
    });
    if (!lead) {
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

    // Whitelist allowed fields for update
    const allowed: Record<string, unknown> = {};
    const updateableFields = ["firstName", "lastName", "email", "phone", "title", "linkedinUrl", "stage", "source", "tags", "companyId", "assignedToId"];
    for (const field of updateableFields) {
      if (body[field] !== undefined) allowed[field] = body[field];
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: allowed,
      include: { company: true, assignedTo: true },
    });
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
