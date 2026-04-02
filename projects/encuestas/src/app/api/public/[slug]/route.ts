import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, jsonError } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const survey = await prisma.survey.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        isActive: true,
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            text: true,
            type: true,
            isRequired: true,
            order: true,
            options: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                text: true,
                order: true,
              },
            },
          },
        },
      },
    });

    if (!survey || !survey.isActive) {
      return jsonError("Encuesta no disponible", 404);
    }

    const { isActive: _, ...publicSurvey } = survey;

    return json(publicSurvey);
  } catch (error) {
    console.error("Error fetching public survey:", error);
    return jsonError("Internal server error", 500);
  }
}
