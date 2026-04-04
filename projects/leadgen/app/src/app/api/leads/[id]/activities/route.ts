import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/scoring";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { id } = await params;
    const activities = await prisma.activity.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    // Whitelist allowed fields
    const allowedTypes = ["NOTE", "EMAIL", "CALL", "MEETING", "LINKEDIN", "OTHER"];
    if (!body.type || !allowedTypes.includes(body.type)) {
      return NextResponse.json(
        { error: "Valid activity type is required", code: "INVALID_TYPE" },
        { status: 400 }
      );
    }

    const validChannels = ["LINKEDIN", "EMAIL", "PHONE", "IN_PERSON", "OTHER"];
    const channel = body.channel && validChannels.includes(body.channel) ? body.channel : "OTHER";

    const activityData = {
      type: body.type,
      channel,
      subject: body.subject || null,
      content: body.content || body.description || null,
      userId: body.userId || null,
    };

    const activity = await prisma.activity.create({
      data: {
        ...activityData,
        leadId: id,
      },
    });

    // Recalculate lead score after new activity
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { company: true, activities: true },
    });
    if (lead) {
      const { total, demographic, behavioral } = calculateScore(lead);
      await prisma.lead.update({
        where: { id },
        data: { score: total, scoreDemographic: demographic, scoreBehavioral: behavioral },
      });
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
