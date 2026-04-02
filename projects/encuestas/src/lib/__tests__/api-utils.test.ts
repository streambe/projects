import { describe, it, expect } from "vitest";
import { validateSurveyBody } from "@/lib/api-utils";

describe("validateSurveyBody", () => {
  const validBody = {
    title: "My Survey",
    questions: [
      { text: "How are you?", type: "TEXT", order: 0 },
    ],
  };

  // --- Happy path ---
  it("accepts a valid body with TEXT question", () => {
    const result = validateSurveyBody(validBody);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.title).toBe("My Survey");
      expect(result.data.questions).toHaveLength(1);
    }
  });

  it("accepts valid body with MULTIPLE_CHOICE and 2+ options", () => {
    const body = {
      title: "MC Survey",
      questions: [
        {
          text: "Pick one",
          type: "MULTIPLE_CHOICE",
          order: 0,
          options: [
            { text: "A", order: 0 },
            { text: "B", order: 1 },
          ],
        },
      ],
    };
    const result = validateSurveyBody(body);
    expect(result.valid).toBe(true);
  });

  it("accepts optional description", () => {
    const body = { ...validBody, description: "Some desc" };
    const result = validateSurveyBody(body);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.data.description).toBe("Some desc");
  });

  it("trims title whitespace", () => {
    const body = { ...validBody, title: "  Trimmed  " };
    const result = validateSurveyBody(body);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.data.title).toBe("Trimmed");
  });

  // --- Missing / invalid inputs ---
  it("rejects null body", () => {
    const result = validateSurveyBody(null);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("body is required");
  });

  it("rejects missing title", () => {
    const result = validateSurveyBody({ questions: [{ text: "Q", type: "TEXT", order: 0 }] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("title");
  });

  it("rejects empty string title", () => {
    const result = validateSurveyBody({ title: "  ", questions: [{ text: "Q", type: "TEXT", order: 0 }] });
    expect(result.valid).toBe(false);
  });

  it("rejects title over 200 chars", () => {
    const result = validateSurveyBody({ title: "a".repeat(201), questions: [{ text: "Q", type: "TEXT", order: 0 }] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("200");
  });

  it("rejects empty questions array", () => {
    const result = validateSurveyBody({ title: "T", questions: [] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("At least 1 question");
  });

  it("rejects missing questions", () => {
    const result = validateSurveyBody({ title: "T" });
    expect(result.valid).toBe(false);
  });

  it("rejects invalid question type", () => {
    const result = validateSurveyBody({
      title: "T",
      questions: [{ text: "Q", type: "INVALID", order: 0 }],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("type must be one of");
  });

  it("rejects question without text", () => {
    const result = validateSurveyBody({
      title: "T",
      questions: [{ type: "TEXT", order: 0 }],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("text is required");
  });

  it("rejects question without order", () => {
    const result = validateSurveyBody({
      title: "T",
      questions: [{ text: "Q", type: "TEXT" }],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("order");
  });

  // --- MULTIPLE_CHOICE option validation ---
  it("rejects MULTIPLE_CHOICE with less than 2 options", () => {
    const result = validateSurveyBody({
      title: "T",
      questions: [
        { text: "Q", type: "MULTIPLE_CHOICE", order: 0, options: [{ text: "Only one", order: 0 }] },
      ],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("at least 2 options");
  });

  it("rejects MULTIPLE_CHOICE with no options", () => {
    const result = validateSurveyBody({
      title: "T",
      questions: [{ text: "Q", type: "MULTIPLE_CHOICE", order: 0 }],
    });
    expect(result.valid).toBe(false);
  });

  it("rejects option without text", () => {
    const result = validateSurveyBody({
      title: "T",
      questions: [
        {
          text: "Q",
          type: "MULTIPLE_CHOICE",
          order: 0,
          options: [
            { text: "", order: 0 },
            { text: "B", order: 1 },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("options[0].text");
  });

  it("rejects option without order", () => {
    const result = validateSurveyBody({
      title: "T",
      questions: [
        {
          text: "Q",
          type: "MULTIPLE_CHOICE",
          order: 0,
          options: [
            { text: "A" },
            { text: "B", order: 1 },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("options[0].order");
  });

  it("rejects non-string description", () => {
    const result = validateSurveyBody({ title: "T", description: 123, questions: [{ text: "Q", type: "TEXT", order: 0 }] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("description must be a string");
  });

  // --- All question types ---
  it("accepts SCALE type", () => {
    const result = validateSurveyBody({
      title: "T",
      questions: [{ text: "Rate", type: "SCALE", order: 0 }],
    });
    expect(result.valid).toBe(true);
  });

  it("accepts YES_NO type", () => {
    const result = validateSurveyBody({
      title: "T",
      questions: [{ text: "Yes?", type: "YES_NO", order: 0 }],
    });
    expect(result.valid).toBe(true);
  });
});
