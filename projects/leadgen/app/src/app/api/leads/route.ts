import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/scoring";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    const search = searchParams.get("search");
    const scoreMin = searchParams.get("scoreMin");
    const scoreMax = searchParams.get("scoreMax");
    const assignedToId = searchParams.get("assignedToId");

    const where: Record<string, unknown> = {};

    if (stage) where.stage = stage;
    if (assignedToId) where.assignedToId = assignedToId;
    if (scoreMin || scoreMax) {
      where.score = {};
      if (scoreMin) (where.score as Record<string, number>).gte = Number(scoreMin);
      if (scoreMax) (where.score as Record<string, number>).lte = Number(scoreMax);
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: { company: true, assignedTo: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads", code: "LEADS_FETCH_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const body = await request.json();

    // Whitelist allowed fields to prevent mass assignment
    const allowed = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email || null,
      phone: body.phone || null,
      title: body.title || null,
      linkedinUrl: body.linkedinUrl || null,
      stage: body.stage || "NEW",
      source: body.source || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      companyId: body.companyId || null,
      assignedToId: body.assignedToId || null,
    };

    if (!allowed.firstName || !allowed.lastName) {
      return NextResponse.json(
        { error: "firstName and lastName are required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Create the lead first
    const created = await prisma.lead.create({
      data: allowed,
      include: { company: true, activities: true },
    });

    // Calculate initial score
    const { total, demographic, behavioral } = calculateScore(created);
    const lead = await prisma.lead.update({
      where: { id: created.id },
      data: { score: total, scoreDemographic: demographic, scoreBehavioral: behavioral },
      include: { company: true, assignedTo: true },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Failed to create lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead", code: "LEAD_CREATE_ERROR" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing lead id", code: "MISSING_ID" },
        { status: 400 }
      );
    }
    const body = await request.json();

    // Whitelist allowed fields for update
    const allowed: Record<string, unknown> = {};
    const updateableFields = ["firstName", "lastName", "email", "phone", "title", "linkedinUrl", "stage", "source", "tags", "companyId", "assignedToId"];
    for (const field of updateableFields) {
      if (body[field] !== undefined) allowed[field] = body[field];
    }

    const lead = await prisma.lead.update({ where: { id }, data: allowed });
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead", code: "LEAD_UPDATE_ERROR" },
      { status: 500 }
    );
  }
}
