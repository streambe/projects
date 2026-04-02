import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helper";
import { json, jsonError } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/surveys/[id]/results
export async function GET(request: NextRequest, context: RouteContext) {
  const userId = await getAuthUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  // Verify survey exists and belongs to user
  const survey = await prisma.survey.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      userId: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          type: true,
          order: true,
          options: {
            orderBy: { order: "asc" },
            select: { id: true, text: true },
          },
          answers: {
            select: { value: true },
          },
        },
      },
    },
  });

  if (!survey) return jsonError("Survey not found", 404);
  if (survey.userId !== userId) return jsonError("Forbidden", 403);

  // Pagination params
  const searchParams = new URL(request.url).searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10) || 10)
  );

  // Total responses + last response date
  const [totalResponses, lastResponse] = await Promise.all([
    prisma.response.count({ where: { surveyId: id } }),
    prisma.response.findFirst({
      where: { surveyId: id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  // Build question stats
  const questions = survey.questions.map((q) => {
    const answers = q.answers;
    let stats: Record<string, unknown>;

    switch (q.type) {
      case "SCALE": {
        const distribution: Record<string, number> = {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
        };
        let sum = 0;
        let count = 0;
        for (const a of answers) {
          const val = parseInt(a.value, 10);
          if (val >= 1 && val <= 5) {
            distribution[String(val)]++;
            sum += val;
            count++;
          }
        }
        stats = {
          average: count > 0 ? Math.round((sum / count) * 100) / 100 : 0,
          distribution,
        };
        break;
      }
      case "MULTIPLE_CHOICE": {
        const countMap = new Map<string, number>();
        for (const a of answers) {
          countMap.set(a.value, (countMap.get(a.value) || 0) + 1);
        }
        const total = answers.length;
        stats = {
          options: q.options.map((opt) => {
            const cnt = countMap.get(opt.id) || 0;
            return {
              id: opt.id,
              text: opt.text,
              count: cnt,
              percentage:
                total > 0 ? Math.round((cnt / total) * 10000) / 100 : 0,
            };
          }),
        };
        break;
      }
      case "YES_NO": {
        let yesCount = 0;
        let noCount = 0;
        for (const a of answers) {
          const v = a.value.toLowerCase();
          if (v === "yes" || v === "true" || v === "si" || v === "sí")
            yesCount++;
          else noCount++;
        }
        const total = yesCount + noCount;
        stats = {
          yes: {
            count: yesCount,
            percentage:
              total > 0 ? Math.round((yesCount / total) * 10000) / 100 : 0,
          },
          no: {
            count: noCount,
            percentage:
              total > 0 ? Math.round((noCount / total) * 10000) / 100 : 0,
          },
        };
        break;
      }
      case "TEXT":
      default: {
        stats = {
          responses: answers.map((a) => a.value),
        };
        break;
      }
    }

    return {
      id: q.id,
      text: q.text,
      type: q.type,
      stats,
    };
  });

  // Paginated individual responses
  const [responsesData, responsesTotal] = await Promise.all([
    prisma.response.findMany({
      where: { surveyId: id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        createdAt: true,
        answers: {
          select: { questionId: true, value: true },
        },
      },
    }),
    prisma.response.count({ where: { surveyId: id } }),
  ]);

  return json({
    survey: {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      createdAt: survey.createdAt,
    },
    totalResponses,
    lastResponseAt: lastResponse?.createdAt?.toISOString() ?? null,
    questions,
    responses: {
      data: responsesData,
      total: responsesTotal,
      page,
      pageSize,
    },
  });
}
