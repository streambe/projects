import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export interface SurveyQuestionInput {
  text: string;
  type: "TEXT" | "MULTIPLE_CHOICE" | "SCALE" | "YES_NO";
  isRequired?: boolean;
  order: number;
  options?: { text: string; order: number }[];
}

export interface CreateSurveyBody {
  title: string;
  description?: string;
  questions: SurveyQuestionInput[];
}

const VALID_TYPES = ["TEXT", "MULTIPLE_CHOICE", "SCALE", "YES_NO"] as const;

export function validateSurveyBody(
  body: unknown
): { valid: true; data: CreateSurveyBody } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const b = body as Record<string, unknown>;

  if (!b.title || typeof b.title !== "string" || b.title.trim().length === 0) {
    return { valid: false, error: "title is required" };
  }
  if (b.title.length > 200) {
    return { valid: false, error: "title must be at most 200 characters" };
  }
  if (b.description !== undefined && b.description !== null && typeof b.description !== "string") {
    return { valid: false, error: "description must be a string" };
  }
  if (!Array.isArray(b.questions) || b.questions.length === 0) {
    return { valid: false, error: "At least 1 question is required" };
  }

  for (let i = 0; i < b.questions.length; i++) {
    const q = b.questions[i] as Record<string, unknown>;
    if (!q.text || typeof q.text !== "string" || q.text.trim().length === 0) {
      return { valid: false, error: `questions[${i}].text is required` };
    }
    if (!q.type || !VALID_TYPES.includes(q.type as (typeof VALID_TYPES)[number])) {
      return {
        valid: false,
        error: `questions[${i}].type must be one of: ${VALID_TYPES.join(", ")}`,
      };
    }
    if (q.order === undefined || typeof q.order !== "number") {
      return { valid: false, error: `questions[${i}].order is required and must be a number` };
    }
    if (q.type === "MULTIPLE_CHOICE") {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return {
          valid: false,
          error: `questions[${i}] of type MULTIPLE_CHOICE requires at least 2 options`,
        };
      }
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j] as Record<string, unknown>;
        if (!opt.text || typeof opt.text !== "string" || (opt.text as string).trim().length === 0) {
          return { valid: false, error: `questions[${i}].options[${j}].text is required` };
        }
        if (opt.order === undefined || typeof opt.order !== "number") {
          return {
            valid: false,
            error: `questions[${i}].options[${j}].order is required and must be a number`,
          };
        }
      }
    }
  }

  return {
    valid: true,
    data: {
      title: (b.title as string).trim(),
      description: b.description ? (b.description as string).trim() : undefined,
      questions: b.questions as SurveyQuestionInput[],
    },
  };
}
