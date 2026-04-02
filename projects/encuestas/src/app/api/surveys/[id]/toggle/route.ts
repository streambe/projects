import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helper";
import { json, jsonError } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/surveys/[id]/toggle
export async function PATCH(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const userId = await getAuthUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const survey = await prisma.survey.findUnique({
    where: { id },
    select: { id: true, userId: true, isActive: true },
  });

  if (!survey) return jsonError("Survey not found", 404);
  if (survey.userId !== userId) return jsonError("Forbidden", 403);

  const updated = await prisma.survey.update({
    where: { id },
    data: { isActive: !survey.isActive },
    select: { id: true, isActive: true },
  });

  return json(updated);
}
