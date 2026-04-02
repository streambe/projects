import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock prisma
const mockFindUnique = vi.fn();
const mockTransaction = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    survey: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

describe("GET /api/public/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callGet(slug: string) {
    const { GET } = await import("../[slug]/route");
    const req = new NextRequest("http://localhost/api/public/" + slug);
    return GET(req, { params: Promise.resolve({ slug }) });
  }

  it("returns survey data for active survey", async () => {
    mockFindUnique.mockResolvedValue({
      id: "s1",
      title: "Test Survey",
      description: "Desc",
      slug: "test-survey",
      isActive: true,
      questions: [
        {
          id: "q1",
          text: "Question 1",
          type: "TEXT",
          isRequired: true,
          order: 1,
          options: [],
        },
      ],
    });

    const res = await callGet("test-survey");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toBe("Test Survey");
    expect(data.questions).toHaveLength(1);
    expect(data).not.toHaveProperty("isActive");
    expect(data).not.toHaveProperty("userId");
    expect(data).not.toHaveProperty("createdAt");
  });

  it("returns 404 for inactive survey", async () => {
    mockFindUnique.mockResolvedValue({
      id: "s1",
      title: "Inactive",
      slug: "inactive",
      isActive: false,
      questions: [],
    });

    const res = await callGet("inactive");
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("Encuesta no disponible");
  });

  it("returns 404 for non-existent survey", async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await callGet("nonexistent");
    expect(res.status).toBe(404);
  });

  it("returns 500 on database error", async () => {
    mockFindUnique.mockRejectedValue(new Error("DB error"));

    const res = await callGet("test");
    expect(res.status).toBe(500);
  });
});

describe("POST /api/public/[slug]/respond", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  const baseSurvey = {
    id: "s1",
    title: "Survey",
    slug: "survey",
    isActive: true,
    questions: [
      { id: "q1", text: "Name", type: "TEXT", isRequired: true, order: 1, options: [] },
      {
        id: "q2",
        text: "Rating",
        type: "SCALE",
        isRequired: true,
        order: 2,
        options: [],
      },
      {
        id: "q3",
        text: "Agree?",
        type: "YES_NO",
        isRequired: false,
        order: 3,
        options: [],
      },
      {
        id: "q4",
        text: "Color",
        type: "MULTIPLE_CHOICE",
        isRequired: true,
        order: 4,
        options: [
          { id: "opt1", text: "Red", order: 1 },
          { id: "opt2", text: "Blue", order: 2 },
        ],
      },
    ],
  };

  async function callPost(slug: string, body: unknown) {
    const { POST } = await import("../[slug]/respond/route");
    const req = new NextRequest("http://localhost/api/public/" + slug + "/respond", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    return POST(req, { params: Promise.resolve({ slug }) });
  }

  it("creates response successfully with valid answers", async () => {
    mockFindUnique.mockResolvedValue(baseSurvey);
    mockTransaction.mockImplementation(async (fn: Function) => {
      const tx = {
        response: { create: vi.fn().mockResolvedValue({ id: "r1" }) },
        answer: { createMany: vi.fn().mockResolvedValue({ count: 3 }) },
      };
      return fn(tx);
    });

    const res = await callPost("survey", {
      answers: [
        { questionId: "q1", value: "John" },
        { questionId: "q2", value: "4" },
        { questionId: "q4", value: "opt1" },
      ],
    });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Respuesta registrada");
  });

  it("returns 404 for inactive survey", async () => {
    mockFindUnique.mockResolvedValue({ ...baseSurvey, isActive: false });

    const res = await callPost("survey", { answers: [] });
    expect(res.status).toBe(404);
  });

  it("returns 400 for missing required question", async () => {
    mockFindUnique.mockResolvedValue(baseSurvey);

    const res = await callPost("survey", {
      answers: [
        { questionId: "q2", value: "3" },
        { questionId: "q4", value: "opt1" },
      ],
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("obligatoria");
  });

  it("returns 400 for invalid SCALE value", async () => {
    mockFindUnique.mockResolvedValue(baseSurvey);

    const res = await callPost("survey", {
      answers: [
        { questionId: "q1", value: "John" },
        { questionId: "q2", value: "9" },
        { questionId: "q4", value: "opt1" },
      ],
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("1 y 5");
  });

  it("returns 400 for invalid YES_NO value", async () => {
    mockFindUnique.mockResolvedValue(baseSurvey);

    const res = await callPost("survey", {
      answers: [
        { questionId: "q1", value: "John" },
        { questionId: "q2", value: "3" },
        { questionId: "q3", value: "maybe" },
        { questionId: "q4", value: "opt1" },
      ],
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("yes");
  });

  it("returns 400 for invalid MULTIPLE_CHOICE optionId", async () => {
    mockFindUnique.mockResolvedValue(baseSurvey);

    const res = await callPost("survey", {
      answers: [
        { questionId: "q1", value: "John" },
        { questionId: "q2", value: "3" },
        { questionId: "q4", value: "invalid-opt" },
      ],
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("optionId válido");
  });

  it("returns 400 for empty TEXT on required question", async () => {
    mockFindUnique.mockResolvedValue(baseSurvey);

    const res = await callPost("survey", {
      answers: [
        { questionId: "q1", value: "   " },
        { questionId: "q2", value: "3" },
        { questionId: "q4", value: "opt1" },
      ],
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("vacía");
  });

  it("returns 400 for unknown questionId", async () => {
    mockFindUnique.mockResolvedValue(baseSurvey);

    const res = await callPost("survey", {
      answers: [
        { questionId: "q1", value: "John" },
        { questionId: "q2", value: "3" },
        { questionId: "q4", value: "opt1" },
        { questionId: "unknown", value: "x" },
      ],
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("no pertenece");
  });

  it("returns 400 for missing body", async () => {
    mockFindUnique.mockResolvedValue(baseSurvey);

    const { POST } = await import("../[slug]/respond/route");
    const req = new NextRequest("http://localhost/api/public/survey/respond", {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ slug: "survey" }) });

    expect(res.status).toBe(400);
  });

  it("returns 400 when answers is not an array", async () => {
    mockFindUnique.mockResolvedValue(baseSurvey);

    const res = await callPost("survey", { answers: "not-array" });
    expect(res.status).toBe(400);
  });

  it("returns 500 on database error during transaction", async () => {
    mockFindUnique.mockResolvedValue(baseSurvey);
    mockTransaction.mockRejectedValue(new Error("TX error"));

    const res = await callPost("survey", {
      answers: [
        { questionId: "q1", value: "John" },
        { questionId: "q2", value: "3" },
        { questionId: "q4", value: "opt1" },
      ],
    });

    expect(res.status).toBe(500);
  });
});
