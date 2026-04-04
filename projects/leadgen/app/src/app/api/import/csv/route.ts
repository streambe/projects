import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv-parser";
import { applyMapping, type ColumnMapping, type ImportResult } from "@/lib/import-utils";
import { calculateScore } from "@/lib/scoring";
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
    const { csvText, mapping } = body as {
      csvText: string;
      mapping: ColumnMapping;
    };

    if (!csvText || typeof csvText !== "string") {
      return NextResponse.json(
        { error: "CSV text is required", code: "MISSING_CSV" },
        { status: 400 }
      );
    }

    if (!mapping || typeof mapping !== "object") {
      return NextResponse.json(
        { error: "Column mapping is required", code: "MISSING_MAPPING" },
        { status: 400 }
      );
    }

    // Parse CSV
    const parsed = parseCsv(csvText);
    if (parsed.rows.length === 0) {
      return NextResponse.json(
        { error: "CSV contains no data rows", code: "EMPTY_CSV" },
        { status: 400 }
      );
    }

    // Apply mapping
    const { leads: mappedLeads, errors } = applyMapping(parsed.rows, mapping);

    let imported = 0;
    let skipped = 0;

    for (const lead of mappedLeads) {
      // Check duplicates by email or linkedinUrl
      if (lead.email || lead.linkedinUrl) {
        const existing = await prisma.lead.findFirst({
          where: {
            OR: [
              ...(lead.email ? [{ email: lead.email }] : []),
              ...(lead.linkedinUrl ? [{ linkedinUrl: lead.linkedinUrl }] : []),
            ],
          },
        });
        if (existing) {
          skipped++;
          continue;
        }
      }

      // Find or create company
      let companyId: string | undefined;
      if (lead.company) {
        const existingCompany = await prisma.company.findFirst({
          where: { name: { equals: lead.company, mode: "insensitive" } },
        });
        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          const newCompany = await prisma.company.create({
            data: {
              name: lead.company,
              industry: lead.industry || null,
            },
          });
          companyId = newCompany.id;
        }
      }

      const created = await prisma.lead.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          title: lead.title || null,
          email: lead.email || null,
          phone: lead.phone || null,
          linkedinUrl: lead.linkedinUrl || null,
          companyId: companyId || null,
        },
        include: { company: true, activities: true },
      });

      // Calculate initial score
      const { total, demographic, behavioral } = calculateScore(created);
      await prisma.lead.update({
        where: { id: created.id },
        data: { score: total, scoreDemographic: demographic, scoreBehavioral: behavioral },
      });

      imported++;
    }

    const result: ImportResult = { imported, skipped, errors };
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to import CSV:", error);
    return NextResponse.json(
      { error: "Failed to import CSV", code: "CSV_IMPORT_ERROR" },
      { status: 500 }
    );
  }
}
