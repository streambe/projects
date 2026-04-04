import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const created = await prisma.lead.createMany({
      data: leads.map((l) => ({
        firstName: String(l.firstName || ""),
        lastName: String(l.lastName || ""),
        email: l.email ? String(l.email) : null,
        phone: l.phone ? String(l.phone) : null,
        title: l.title ? String(l.title) : null,
        linkedinUrl: l.linkedinUrl ? String(l.linkedinUrl) : null,
        tags: Array.isArray(l.tags) ? l.tags.map(String) : [],
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      { imported: created.count },
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
