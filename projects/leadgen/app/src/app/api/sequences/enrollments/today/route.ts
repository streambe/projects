import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const enrollments = await prisma.sequenceEnrollment.findMany({
      where: {
        status: "ACTIVE",
        nextActionAt: { lte: endOfToday },
      },
      include: {
        lead: { include: { company: true } },
        sequence: {
          include: {
            steps: {
              orderBy: { order: "asc" },
              include: { template: true },
            },
          },
        },
      },
      orderBy: { nextActionAt: "asc" },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Failed to fetch today actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch today actions", code: "TODAY_ACTIONS_ERROR" },
      { status: 500 }
    );
  }
}
