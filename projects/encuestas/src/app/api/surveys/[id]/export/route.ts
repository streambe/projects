import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helper";
import { jsonError } from "@/lib/api-utils";
import * as XLSX from "xlsx";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const userId = await getAuthUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  // Verify ownership
  const survey = await prisma.survey.findUnique({
    where: { id },
    select: { id: true, userId: true, title: true },
  });
  if (!survey) return jsonError("Survey not found", 404);
  if (survey.userId !== userId) return jsonError("Forbidden", 403);

  // Get format from query param
  const format = request.nextUrl.searchParams.get("format") || "xlsx";
  if (format !== "xlsx" && format !== "csv") {
    return jsonError("Invalid format. Use 'xlsx' or 'csv'", 400);
  }

  // Fetch questions with options, ordered
  const questions = await prisma.question.findMany({
    where: { surveyId: id },
    orderBy: { order: "asc" },
    include: { options: true },
  });

  // Fetch all responses with answers
  const responses = await prisma.response.findMany({
    where: { surveyId: id },
    orderBy: { createdAt: "asc" },
    include: {
      answers: true,
    },
  });

  // Build option lookup: optionId -> text
  const optionTextMap = new Map<string, string>();
  for (const q of questions) {
    for (const opt of q.options) {
      optionTextMap.set(opt.id, opt.text);
    }
  }

  // Build headers
  const headers = ["Fecha respuesta", ...questions.map((q) => q.text)];

  // Build rows
  const rows = responses.map((resp) => {
    const answerByQuestion = new Map<string, string>();
    for (const ans of resp.answers) {
      answerByQuestion.set(ans.questionId, ans.value);
    }

    const row: string[] = [
      resp.createdAt.toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
    ];

    for (const q of questions) {
      const raw = answerByQuestion.get(q.id) ?? "";
      switch (q.type) {
        case "MULTIPLE_CHOICE":
          row.push(optionTextMap.get(raw) ?? raw);
          break;
        case "YES_NO":
          row.push(raw === "true" ? "Sí" : raw === "false" ? "No" : raw);
          break;
        case "SCALE":
          row.push(raw);
          break;
        case "TEXT":
        default:
          row.push(raw);
          break;
      }
    }
    return row;
  });

  // Create workbook
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Respuestas");

  // Sanitize filename
  const safeTitle = survey.title.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ _-]/g, "").trim() || "encuesta";

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeTitle}-resultados.csv"`,
      },
    });
  }

  // xlsx
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeTitle}-resultados.xlsx"`,
    },
  });
}
