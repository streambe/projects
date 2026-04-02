import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, jsonError } from "@/lib/api-utils";

interface AnswerInput {
  questionId: string;
  value: string;
}

interface RespondBody {
  answers: AnswerInput[];
}

function validateBody(
  body: unknown
): { valid: true; data: RespondBody } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const b = body as Record<string, unknown>;

  if (!Array.isArray(b.answers)) {
    return { valid: false, error: "answers must be an array" };
  }

  for (let i = 0; i < b.answers.length; i++) {
    const a = b.answers[i] as Record<string, unknown>;
    if (!a.questionId || typeof a.questionId !== "string") {
      return { valid: false, error: `answers[${i}].questionId is required` };
    }
    if (a.value === undefined || a.value === null || typeof a.value !== "string") {
      return { valid: false, error: `answers[${i}].value must be a string` };
    }
  }

  return { valid: true, data: { answers: b.answers as AnswerInput[] } };
}

const VALID_SCALE_VALUES = ["1", "2", "3", "4", "5"];
const VALID_YES_NO_VALUES = ["yes", "no"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const survey = await prisma.survey.findUnique({
      where: { slug },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (!survey || !survey.isActive) {
      return jsonError("Encuesta no disponible", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const validation = validateBody(body);
    if (!validation.valid) {
      return jsonError(validation.error, 400);
    }

    const { answers } = validation.data;

    // Build a map of questionId -> question for fast lookup
    const questionMap = new Map(
      survey.questions.map((q) => [q.id, q])
    );

    // Check all required questions have answers
    const answeredIds = new Set(answers.map((a) => a.questionId));
    for (const question of survey.questions) {
      if (question.isRequired && !answeredIds.has(question.id)) {
        return jsonError(
          `La pregunta "${question.text}" es obligatoria`,
          400
        );
      }
    }

    // Validate each answer
    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        return jsonError(
          `questionId "${answer.questionId}" no pertenece a esta encuesta`,
          400
        );
      }

      switch (question.type) {
        case "SCALE":
          if (!VALID_SCALE_VALUES.includes(answer.value)) {
            return jsonError(
              `La pregunta "${question.text}" requiere un valor entre 1 y 5`,
              400
            );
          }
          break;
        case "YES_NO":
          if (!VALID_YES_NO_VALUES.includes(answer.value)) {
            return jsonError(
              `La pregunta "${question.text}" requiere "yes" o "no"`,
              400
            );
          }
          break;
        case "MULTIPLE_CHOICE": {
          const validOptionIds = question.options.map((o) => o.id);
          if (!validOptionIds.includes(answer.value)) {
            return jsonError(
              `La pregunta "${question.text}" requiere un optionId válido`,
              400
            );
          }
          break;
        }
        case "TEXT":
          if (question.isRequired && answer.value.trim().length === 0) {
            return jsonError(
              `La pregunta "${question.text}" no puede estar vacía`,
              400
            );
          }
          break;
      }
    }

    // Create Response + Answers in a transaction
    await prisma.$transaction(async (tx) => {
      const response = await tx.response.create({
        data: {
          surveyId: survey.id,
        },
      });

      await tx.answer.createMany({
        data: answers.map((a) => ({
          value: a.value,
          questionId: a.questionId,
          responseId: response.id,
        })),
      });
    });

    return json(
      { success: true, message: "Respuesta registrada" },
      201
    );
  } catch (error) {
    console.error("Error submitting response:", error);
    return jsonError("Internal server error", 500);
  }
}
