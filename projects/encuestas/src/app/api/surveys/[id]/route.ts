import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helper";
import { json, jsonError, validateSurveyBody } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

async function getSurveyIfOwner(surveyId: string, userId: string) {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { id: true, userId: true },
  });
  if (!survey) return { error: jsonError("Survey not found", 404) };
  if (survey.userId !== userId) return { error: jsonError("Forbidden", 403) };
  return { survey };
}

// GET /api/surveys/[id]
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const userId = await getAuthUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const check = await getSurveyIfOwner(id, userId);
  if (check.error) return check.error;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  return json(survey);
}

// PUT /api/surveys/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const userId = await getAuthUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const check = await getSurveyIfOwner(id, userId);
  if (check.error) return check.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const validation = validateSurveyBody(body);
  if (!validation.valid) {
    return jsonError(validation.error, 400);
  }

  const { title, description, questions } = validation.data;

  const survey = await prisma.$transaction(async (tx) => {
    // Delete existing questions (cascade deletes options)
    await tx.question.deleteMany({ where: { surveyId: id } });

    return tx.survey.update({
      where: { id },
      data: {
        title,
        description: description ?? null,
        questions: {
          create: questions.map((q) => ({
            text: q.text.trim(),
            type: q.type,
            isRequired: q.isRequired ?? false,
            order: q.order,
            options: q.options
              ? {
                  create: q.options.map((o) => ({
                    text: o.text.trim(),
                    order: o.order,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { options: { orderBy: { order: "asc" } } },
        },
      },
    });
  });

  return json(survey);
}

// DELETE /api/surveys/[id]
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const userId = await getAuthUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const check = await getSurveyIfOwner(id, userId);
  if (check.error) return check.error;

  await prisma.survey.delete({ where: { id } });

  return json({ deleted: true });
}
