import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helper";
import { json, jsonError, validateSurveyBody } from "@/lib/api-utils";

// GET /api/surveys — list surveys for authenticated user
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const surveys = await prisma.survey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          questions: true,
          responses: true,
        },
      },
    },
  });

  return json(surveys);
}

// POST /api/surveys — create survey with questions and options
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return jsonError("Unauthorized", 401);

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

  const slug = `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)}-${nanoid(8)}`;

  const survey = await prisma.survey.create({
    data: {
      title,
      description: description ?? null,
      slug,
      isActive: false,
      userId,
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

  return json(survey, 201);
}
