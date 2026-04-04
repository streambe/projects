import { describe, it, expect } from "vitest";
import { calculateScore, labelForScore, type ScoreLabel } from "../scoring";

// ---------------------------------------------------------------------------
// Helpers to build minimal fixtures
// ---------------------------------------------------------------------------

function makeLead(overrides: Record<string, unknown> = {}) {
  return {
    id: "lead-1",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    title: null as string | null,
    phone: null,
    linkedinUrl: null,
    stage: "NEW" as const,
    score: 0,
    companyId: null,
    ownerId: null,
    source: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeCompany(overrides: Record<string, unknown> = {}) {
  return {
    id: "co-1",
    name: "Acme",
    industry: null as string | null,
    size: null as string | null,
    country: null as string | null,
    website: null,
    linkedinUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeActivity(type: string) {
  return {
    id: `act-${type}`,
    leadId: "lead-1",
    type,
    channel: null,
    description: null,
    metadata: null,
    sequenceStepId: null,
    enrollmentId: null,
    createdAt: new Date(),
  };
}

// ---------------------------------------------------------------------------
// Demographic scoring
// ---------------------------------------------------------------------------

describe("scoring - demographic", () => {
  it("should give max demographic score for CEO + health + enterprise + Argentina", () => {
    const lead = makeLead({ title: "CEO" });
    const company = makeCompany({
      industry: "salud",
      size: "ENTERPRISE",
      country: "argentina",
    });
    const result = calculateScore({ ...lead, company, activities: [] });

    // title 15 + industry 10 + size 10 + country 5 = 40 (max demographic)
    expect(result.demographic).toBe(40);
  });

  it("should score Director title at 12 points", () => {
    const lead = makeLead({ title: "Director de Ventas" });
    const result = calculateScore({ ...lead, company: null, activities: [] });
    // title 12 + industry default 3 + size 0 + country default 1 = 16
    expect(result.demographic).toBe(16);
  });

  it("should score Manager/Gerente title at 8 points", () => {
    const lead = makeLead({ title: "Gerente Comercial" });
    const result = calculateScore({ ...lead, company: null, activities: [] });
    // title 8 + 3 + 0 + 1 = 12
    expect(result.demographic).toBe(12);
  });

  it("should give default 3 for unknown title", () => {
    const lead = makeLead({ title: "Intern" });
    const result = calculateScore({ ...lead, company: null, activities: [] });
    // title 3 + 3 + 0 + 1 = 7
    expect(result.demographic).toBe(7);
  });

  it("should give default 3 for null title", () => {
    const lead = makeLead({ title: null });
    const result = calculateScore({ ...lead, company: null, activities: [] });
    expect(result.demographic).toBe(7); // 3 + 3 + 0 + 1
  });

  it("should score LATAM countries at 3 points", () => {
    const lead = makeLead({});
    const company = makeCompany({ country: "Chile" });
    const result = calculateScore({ ...lead, company, activities: [] });
    // title 3 + industry 3 + size 0 + country 3 = 9
    expect(result.demographic).toBe(9);
  });

  it("should score non-LATAM countries at 1 point", () => {
    const lead = makeLead({});
    const company = makeCompany({ country: "Germany" });
    const result = calculateScore({ ...lead, company, activities: [] });
    // title 3 + 3 + 0 + 1 = 7
    expect(result.demographic).toBe(7);
  });

  it("should score tech industry at 7", () => {
    const lead = makeLead({});
    const company = makeCompany({ industry: "tech" });
    const result = calculateScore({ ...lead, company, activities: [] });
    // 3 + 7 + 0 + 1 = 11
    expect(result.demographic).toBe(11);
  });

  it("should score pharma industry at 8", () => {
    const lead = makeLead({});
    const company = makeCompany({ industry: "pharma" });
    const result = calculateScore({ ...lead, company, activities: [] });
    // 3 + 8 + 0 + 1 = 12
    expect(result.demographic).toBe(12);
  });

  it("should cap demographic at 40", () => {
    // Even if somehow totals exceed 40, it's capped
    const lead = makeLead({ title: "CEO Founder" });
    const company = makeCompany({
      industry: "salud",
      size: "ENTERPRISE",
      country: "argentina",
    });
    const result = calculateScore({ ...lead, company, activities: [] });
    expect(result.demographic).toBeLessThanOrEqual(40);
  });

  it("should handle STARTUP size at 2 points", () => {
    const lead = makeLead({});
    const company = makeCompany({ size: "STARTUP" });
    const result = calculateScore({ ...lead, company, activities: [] });
    // 3 + 3 + 2 + 1 = 9
    expect(result.demographic).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// Behavioral scoring
// ---------------------------------------------------------------------------

describe("scoring - behavioral", () => {
  it("should return 0 behavioral with no activities", () => {
    const lead = makeLead({});
    const result = calculateScore({ ...lead, company: null, activities: [] });
    expect(result.behavioral).toBe(0);
  });

  it("should score LINKEDIN_CONNECT at 10", () => {
    const result = calculateScore({
      ...makeLead({}),
      company: null,
      activities: [makeActivity("LINKEDIN_CONNECT")],
    });
    expect(result.behavioral).toBe(10);
  });

  it("should score LINKEDIN_MESSAGE at 15", () => {
    const result = calculateScore({
      ...makeLead({}),
      company: null,
      activities: [makeActivity("LINKEDIN_MESSAGE")],
    });
    expect(result.behavioral).toBe(15);
  });

  it("should score CALL at 20", () => {
    const result = calculateScore({
      ...makeLead({}),
      company: null,
      activities: [makeActivity("CALL")],
    });
    expect(result.behavioral).toBe(20);
  });

  it("should accumulate multiple activities", () => {
    const result = calculateScore({
      ...makeLead({}),
      company: null,
      activities: [
        makeActivity("LINKEDIN_CONNECT"), // 10
        makeActivity("EMAIL_SENT"),       // 5
        makeActivity("MEETING"),          // 15
      ],
    });
    expect(result.behavioral).toBe(30);
  });

  it("should cap behavioral at 60", () => {
    // 4 x CALL = 80, but capped at 60
    const result = calculateScore({
      ...makeLead({}),
      company: null,
      activities: [
        makeActivity("CALL"),    // 20
        makeActivity("CALL"),    // 20
        makeActivity("CALL"),    // 20
        makeActivity("CALL"),    // 20
      ],
    });
    expect(result.behavioral).toBe(60);
  });

  it("should give 0 points for NOTE activity (not scored)", () => {
    const result = calculateScore({
      ...makeLead({}),
      company: null,
      activities: [makeActivity("NOTE")],
    });
    expect(result.behavioral).toBe(0);
  });

  it("should give 0 points for STAGE_CHANGE activity (not scored)", () => {
    const result = calculateScore({
      ...makeLead({}),
      company: null,
      activities: [makeActivity("STAGE_CHANGE")],
    });
    expect(result.behavioral).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Total score and thresholds
// ---------------------------------------------------------------------------

describe("scoring - thresholds (COLD/WARM/MQL/SQL)", () => {
  it("should label COLD when total < 20", () => {
    // No activities, low demographic
    const result = calculateScore({
      ...makeLead({ title: "Intern" }),
      company: null,
      activities: [],
    });
    expect(result.total).toBeLessThan(20);
    expect(result.label).toBe("COLD");
  });

  it("should label WARM when total 20-39", () => {
    // demographic ~7 + behavioral 15 = 22
    const result = calculateScore({
      ...makeLead({}),
      company: null,
      activities: [makeActivity("LINKEDIN_MESSAGE")], // 15
    });
    // 7 + 15 = 22
    expect(result.total).toBeGreaterThanOrEqual(20);
    expect(result.total).toBeLessThan(40);
    expect(result.label).toBe("WARM");
  });

  it("should label MQL when total 40-69", () => {
    const lead = makeLead({ title: "CEO" });
    const company = makeCompany({
      industry: "salud",
      size: "ENTERPRISE",
      country: "argentina",
    });
    // demographic 40 + behavioral 0 = 40
    const result = calculateScore({ ...lead, company, activities: [] });
    expect(result.total).toBeGreaterThanOrEqual(40);
    expect(result.total).toBeLessThan(70);
    expect(result.label).toBe("MQL");
  });

  it("should label SQL when total >= 70", () => {
    const lead = makeLead({ title: "CEO" });
    const company = makeCompany({
      industry: "salud",
      size: "ENTERPRISE",
      country: "argentina",
    });
    // demographic 40 + behavioral 30 = 70
    const result = calculateScore({
      ...lead,
      company,
      activities: [
        makeActivity("CALL"),             // 20
        makeActivity("LINKEDIN_CONNECT"), // 10
      ],
    });
    expect(result.total).toBeGreaterThanOrEqual(70);
    expect(result.label).toBe("SQL");
  });

  it("should return correct total = demographic + behavioral", () => {
    const lead = makeLead({ title: "Director" });
    const company = makeCompany({ industry: "tech", country: "mexico" });
    // demographic: 12 + 7 + 0 + 3 = 22
    // behavioral: 20 (CALL)
    const result = calculateScore({
      ...lead,
      company,
      activities: [makeActivity("CALL")],
    });
    expect(result.total).toBe(result.demographic + result.behavioral);
    expect(result.total).toBe(42);
    expect(result.label).toBe("MQL");
  });
});

// ---------------------------------------------------------------------------
// labelForScore utility
// ---------------------------------------------------------------------------

describe("labelForScore", () => {
  const cases: [number, ScoreLabel][] = [
    [0, "COLD"],
    [19, "COLD"],
    [20, "WARM"],
    [39, "WARM"],
    [40, "MQL"],
    [69, "MQL"],
    [70, "SQL"],
    [100, "SQL"],
  ];

  it.each(cases)("should return %s for score %i", (score, expected) => {
    expect(labelForScore(score)).toBe(expected);
  });
});
