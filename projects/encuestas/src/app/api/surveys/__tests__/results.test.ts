import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    survey: { findUnique: vi.fn() },
    response: { count: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock("@/lib/auth-helper", () => ({
  getAuthUserId: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helper";
import { GET } from "../[id]/results/route";

const mockPrisma = prisma as unknown as {
  survey: { findUnique: ReturnType<typeof vi.fn> };
  response: {
    count: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
};
const mockGetAuthUserId = getAuthUserId as ReturnType<typeof vi.fn>;

const USER_ID = "user-1";
const SURVEY_ID = "survey-1";

function makeRequest(queryString = ""): Request {
  return new Request(
    `http://localhost/api/surveys/${SURVEY_ID}/results${queryString}`
  );
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) } as any;
}

// A full survey fixture with one question per type
function makeSurveyFixture() {
  return {
    id: SURVEY_ID,
    title: "Test Survey",
    description: "A survey",
    createdAt: new Date("2025-01-01"),
    userId: USER_ID,
    questions: [
      {
        id: "q-scale",
        text: "Rate us",
        type: "SCALE" as const,
        order: 1,
        options: [],
        answers: [
          { value: "5" },
          { value: "3" },
          { value: "4" },
          { value: "5" },
        ],
      },
      {
        id: "q-mc",
        text: "Favorite color",
        type: "MULTIPLE_CHOICE" as const,
        order: 2,
        options: [
          { id: "opt-red", text: "Red" },
          { id: "opt-blue", text: "Blue" },
        ],
        answers: [
          { value: "opt-red" },
          { value: "opt-red" },
          { value: "opt-blue" },
        ],
      },
      {
        id: "q-yn",
        text: "Do you agree?",
        type: "YES_NO" as const,
        order: 3,
        options: [],
        answers: [{ value: "yes" }, { value: "no" }, { value: "yes" }],
      },
      {
        id: "q-text",
        text: "Comments",
        type: "TEXT" as const,
        order: 4,
        options: [],
        answers: [{ value: "Great" }, { value: "Meh" }],
      },
    ],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthUserId.mockResolvedValue(USER_ID);
});

// ==================== Auth ====================
describe("GET /api/surveys/[id]/results — Auth", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetAuthUserId.mockResolvedValue(null);
    const res = await GET(makeRequest() as any, makeParams(SURVEY_ID));
    expect(res.status).toBe(401);
  });
});

// ==================== Ownership ====================
describe("GET /api/surveys/[id]/results — Ownership", () => {
  it("returns 404 when survey not found", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue(null);
    const res = await GET(makeRequest() as any, makeParams("nonexistent"));
    expect(res.status).toBe(404);
  });

  it("returns 403 when survey belongs to another user", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue({
      ...makeSurveyFixture(),
      userId: "other-user",
    });
    const res = await GET(makeRequest() as any, makeParams(SURVEY_ID));
    expect(res.status).toBe(403);
  });
});

// ==================== Happy Path ====================
describe("GET /api/surveys/[id]/results — Happy path", () => {
  const lastDate = new Date("2025-06-15T10:00:00Z");

  beforeEach(() => {
    mockPrisma.survey.findUnique.mockResolvedValue(makeSurveyFixture());
    mockPrisma.response.count.mockResolvedValue(4);
    mockPrisma.response.findFirst.mockResolvedValue({ createdAt: lastDate });
    mockPrisma.response.findMany.mockResolvedValue([
      {
        id: "resp-1",
        createdAt: lastDate,
        answers: [{ questionId: "q-scale", value: "5" }],
      },
    ]);
  });

  it("returns 200 with aggregated results", async () => {
    const res = await GET(makeRequest() as any, makeParams(SURVEY_ID));
    expect(res.status).toBe(200);
    const body = await res.json();

    // Survey metadata
    expect(body.survey.id).toBe(SURVEY_ID);
    expect(body.survey.title).toBe("Test Survey");
    expect(body.totalResponses).toBe(4);
    expect(body.lastResponseAt).toBe(lastDate.toISOString());

    // 4 questions
    expect(body.questions).toHaveLength(4);
  });

  it("computes SCALE stats correctly", async () => {
    const res = await GET(makeRequest() as any, makeParams(SURVEY_ID));
    const body = await res.json();
    const q = body.questions.find((q: any) => q.type === "SCALE");

    // (5+3+4+5)/4 = 4.25
    expect(q.stats.average).toBe(4.25);
    expect(q.stats.distribution["5"]).toBe(2);
    expect(q.stats.distribution["3"]).toBe(1);
    expect(q.stats.distribution["4"]).toBe(1);
    expect(q.stats.distribution["1"]).toBe(0);
  });

  it("computes MULTIPLE_CHOICE stats correctly", async () => {
    const res = await GET(makeRequest() as any, makeParams(SURVEY_ID));
    const body = await res.json();
    const q = body.questions.find((q: any) => q.type === "MULTIPLE_CHOICE");

    expect(q.stats.options).toHaveLength(2);
    const red = q.stats.options.find((o: any) => o.id === "opt-red");
    expect(red.count).toBe(2);
    expect(red.percentage).toBeCloseTo(66.67, 1);
    const blue = q.stats.options.find((o: any) => o.id === "opt-blue");
    expect(blue.count).toBe(1);
    expect(blue.percentage).toBeCloseTo(33.33, 1);
  });

  it("computes YES_NO stats correctly", async () => {
    const res = await GET(makeRequest() as any, makeParams(SURVEY_ID));
    const body = await res.json();
    const q = body.questions.find((q: any) => q.type === "YES_NO");

    expect(q.stats.yes.count).toBe(2);
    expect(q.stats.no.count).toBe(1);
    expect(q.stats.yes.percentage).toBeCloseTo(66.67, 1);
    expect(q.stats.no.percentage).toBeCloseTo(33.33, 1);
  });

  it("returns TEXT responses as array", async () => {
    const res = await GET(makeRequest() as any, makeParams(SURVEY_ID));
    const body = await res.json();
    const q = body.questions.find((q: any) => q.type === "TEXT");

    expect(q.stats.responses).toEqual(["Great", "Meh"]);
  });

  it("returns paginated responses", async () => {
    const res = await GET(makeRequest() as any, makeParams(SURVEY_ID));
    const body = await res.json();

    expect(body.responses.page).toBe(1);
    expect(body.responses.pageSize).toBe(10);
    expect(body.responses.total).toBe(4);
    expect(body.responses.data).toHaveLength(1);
  });
});

// ==================== Pagination ====================
describe("GET /api/surveys/[id]/results — Pagination", () => {
  beforeEach(() => {
    mockPrisma.survey.findUnique.mockResolvedValue(makeSurveyFixture());
    mockPrisma.response.count.mockResolvedValue(25);
    mockPrisma.response.findFirst.mockResolvedValue({
      createdAt: new Date(),
    });
    mockPrisma.response.findMany.mockResolvedValue([]);
  });

  it("respects page and pageSize query params", async () => {
    const res = await GET(
      makeRequest("?page=2&pageSize=5") as any,
      makeParams(SURVEY_ID)
    );
    const body = await res.json();

    expect(body.responses.page).toBe(2);
    expect(body.responses.pageSize).toBe(5);

    // Verify prisma was called with correct skip/take
    expect(mockPrisma.response.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it("clamps page to minimum 1", async () => {
    const res = await GET(
      makeRequest("?page=-3") as any,
      makeParams(SURVEY_ID)
    );
    const body = await res.json();
    expect(body.responses.page).toBe(1);
  });

  it("clamps pageSize to max 100", async () => {
    const res = await GET(
      makeRequest("?pageSize=999") as any,
      makeParams(SURVEY_ID)
    );
    const body = await res.json();
    expect(body.responses.pageSize).toBe(100);
  });
});

// ==================== Edge: no responses ====================
describe("GET /api/surveys/[id]/results — No responses", () => {
  it("returns zero stats when no responses exist", async () => {
    const emptySurvey = {
      ...makeSurveyFixture(),
      questions: makeSurveyFixture().questions.map((q) => ({
        ...q,
        answers: [],
      })),
    };
    mockPrisma.survey.findUnique.mockResolvedValue(emptySurvey);
    mockPrisma.response.count.mockResolvedValue(0);
    mockPrisma.response.findFirst.mockResolvedValue(null);
    mockPrisma.response.findMany.mockResolvedValue([]);

    const res = await GET(makeRequest() as any, makeParams(SURVEY_ID));
    const body = await res.json();

    expect(body.totalResponses).toBe(0);
    expect(body.lastResponseAt).toBeNull();

    const scale = body.questions.find((q: any) => q.type === "SCALE");
    expect(scale.stats.average).toBe(0);

    const yn = body.questions.find((q: any) => q.type === "YES_NO");
    expect(yn.stats.yes.count).toBe(0);
    expect(yn.stats.yes.percentage).toBe(0);
  });
});
