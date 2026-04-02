import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    survey: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    question: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth-helper", () => ({
  getAuthUserId: vi.fn(),
}));

// Import after mocks
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helper";
import { GET, POST } from "../route";
import { GET as GET_BY_ID, PUT, DELETE } from "../[id]/route";
import { PATCH } from "../[id]/toggle/route";

const mockPrisma = prisma as unknown as {
  survey: { findMany: ReturnType<typeof vi.fn>; findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  question: { deleteMany: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};
const mockGetAuthUserId = getAuthUserId as ReturnType<typeof vi.fn>;

function makeRequest(body?: unknown): Request {
  if (body) {
    return new Request("http://localhost/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
  return new Request("http://localhost/api/surveys");
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) } as any;
}

const USER_ID = "user-1";

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthUserId.mockResolvedValue(USER_ID);
});

// ==================== GET /api/surveys ====================
describe("GET /api/surveys", () => {
  it("returns surveys for authenticated user", async () => {
    const surveys = [{ id: "s1", title: "S1", _count: { questions: 2, responses: 5 } }];
    mockPrisma.survey.findMany.mockResolvedValue(surveys);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(surveys);
    expect(mockPrisma.survey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_ID }, orderBy: { createdAt: "desc" } })
    );
  });

  it("returns 401 if not authenticated", async () => {
    mockGetAuthUserId.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});

// ==================== POST /api/surveys ====================
describe("POST /api/surveys", () => {
  const validBody = {
    title: "New Survey",
    questions: [{ text: "Q1", type: "TEXT", order: 0 }],
  };

  it("creates survey and returns 201", async () => {
    const created = { id: "s1", ...validBody, slug: "new-survey-abc123" };
    mockPrisma.survey.create.mockResolvedValue(created);

    const res = await POST(makeRequest(validBody) as any);
    expect(res.status).toBe(201);
    expect(mockPrisma.survey.create).toHaveBeenCalled();
  });

  it("returns 401 if not authenticated", async () => {
    mockGetAuthUserId.mockResolvedValue(null);
    const res = await POST(makeRequest(validBody) as any);
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing title", async () => {
    const res = await POST(makeRequest({ questions: [{ text: "Q", type: "TEXT", order: 0 }] }) as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("title");
  });

  it("returns 400 for empty questions", async () => {
    const res = await POST(makeRequest({ title: "T", questions: [] }) as any);
    expect(res.status).toBe(400);
  });

  it("returns 400 for MULTIPLE_CHOICE without enough options", async () => {
    const body = {
      title: "T",
      questions: [{ text: "Q", type: "MULTIPLE_CHOICE", order: 0, options: [{ text: "A", order: 0 }] }],
    };
    const res = await POST(makeRequest(body) as any);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/surveys", {
      method: "POST",
      body: "not json",
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid JSON");
  });
});

// ==================== GET /api/surveys/[id] ====================
describe("GET /api/surveys/[id]", () => {
  it("returns survey with questions for owner", async () => {
    mockPrisma.survey.findUnique
      .mockResolvedValueOnce({ id: "s1", userId: USER_ID }) // ownership check
      .mockResolvedValueOnce({ id: "s1", title: "S", questions: [] }); // full fetch

    const res = await GET_BY_ID(makeRequest() as any, makeParams("s1"));
    expect(res.status).toBe(200);
  });

  it("returns 404 if survey not found", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue(null);
    const res = await GET_BY_ID(makeRequest() as any, makeParams("nope"));
    expect(res.status).toBe(404);
  });

  it("returns 403 if not owner", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue({ id: "s1", userId: "other-user" });
    const res = await GET_BY_ID(makeRequest() as any, makeParams("s1"));
    expect(res.status).toBe(403);
  });

  it("returns 401 if not authenticated", async () => {
    mockGetAuthUserId.mockResolvedValue(null);
    const res = await GET_BY_ID(makeRequest() as any, makeParams("s1"));
    expect(res.status).toBe(401);
  });
});

// ==================== PUT /api/surveys/[id] ====================
describe("PUT /api/surveys/[id]", () => {
  const updateBody = {
    title: "Updated",
    questions: [{ text: "Q1", type: "TEXT", order: 0 }],
  };

  it("updates survey for owner", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue({ id: "s1", userId: USER_ID });
    const updated = { id: "s1", title: "Updated" };
    mockPrisma.$transaction.mockImplementation(async (fn: any) => fn({
      question: { deleteMany: vi.fn() },
      survey: { update: vi.fn().mockResolvedValue(updated) },
    }));

    const req = new Request("http://localhost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateBody),
    });
    const res = await PUT(req as any, makeParams("s1"));
    expect(res.status).toBe(200);
  });

  it("returns 404 if not found", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue(null);
    const req = new Request("http://localhost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateBody),
    });
    const res = await PUT(req as any, makeParams("nope"));
    expect(res.status).toBe(404);
  });

  it("returns 403 if not owner", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue({ id: "s1", userId: "other" });
    const req = new Request("http://localhost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateBody),
    });
    const res = await PUT(req as any, makeParams("s1"));
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid body", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue({ id: "s1", userId: USER_ID });
    const req = new Request("http://localhost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    const res = await PUT(req as any, makeParams("s1"));
    expect(res.status).toBe(400);
  });

  it("returns 401 if not authenticated", async () => {
    mockGetAuthUserId.mockResolvedValue(null);
    const req = new Request("http://localhost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateBody),
    });
    const res = await PUT(req as any, makeParams("s1"));
    expect(res.status).toBe(401);
  });
});

// ==================== DELETE /api/surveys/[id] ====================
describe("DELETE /api/surveys/[id]", () => {
  it("deletes survey for owner", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue({ id: "s1", userId: USER_ID });
    mockPrisma.survey.delete.mockResolvedValue({});

    const res = await DELETE(makeRequest() as any, makeParams("s1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.deleted).toBe(true);
  });

  it("returns 404 if not found", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue(null);
    const res = await DELETE(makeRequest() as any, makeParams("nope"));
    expect(res.status).toBe(404);
  });

  it("returns 403 if not owner", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue({ id: "s1", userId: "other" });
    const res = await DELETE(makeRequest() as any, makeParams("s1"));
    expect(res.status).toBe(403);
  });

  it("returns 401 if not authenticated", async () => {
    mockGetAuthUserId.mockResolvedValue(null);
    const res = await DELETE(makeRequest() as any, makeParams("s1"));
    expect(res.status).toBe(401);
  });
});

// ==================== PATCH /api/surveys/[id]/toggle ====================
describe("PATCH /api/surveys/[id]/toggle", () => {
  it("toggles isActive from false to true", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue({ id: "s1", userId: USER_ID, isActive: false });
    mockPrisma.survey.update.mockResolvedValue({ id: "s1", isActive: true });

    const res = await PATCH(makeRequest() as any, makeParams("s1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isActive).toBe(true);
    expect(mockPrisma.survey.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: true } })
    );
  });

  it("toggles isActive from true to false", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue({ id: "s1", userId: USER_ID, isActive: true });
    mockPrisma.survey.update.mockResolvedValue({ id: "s1", isActive: false });

    const res = await PATCH(makeRequest() as any, makeParams("s1"));
    expect(res.status).toBe(200);
  });

  it("returns 404 if not found", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue(null);
    const res = await PATCH(makeRequest() as any, makeParams("nope"));
    expect(res.status).toBe(404);
  });

  it("returns 403 if not owner", async () => {
    mockPrisma.survey.findUnique.mockResolvedValue({ id: "s1", userId: "other", isActive: false });
    const res = await PATCH(makeRequest() as any, makeParams("s1"));
    expect(res.status).toBe(403);
  });

  it("returns 401 if not authenticated", async () => {
    mockGetAuthUserId.mockResolvedValue(null);
    const res = await PATCH(makeRequest() as any, makeParams("s1"));
    expect(res.status).toBe(401);
  });
});
