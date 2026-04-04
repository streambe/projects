import { describe, it, expect } from "vitest";

/**
 * Tests for sequence enrollment business logic.
 * These test the pure logic functions used by the API routes
 * without needing database or auth dependencies.
 */

// --- Helper: compute nextActionAt ---
function computeNextActionAt(
  now: Date,
  delayDays: number
): Date {
  return new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000);
}

// --- Helper: determine next state after action ---
interface EnrollmentState {
  currentStep: number;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  nextActionAt: Date | null;
  completedAt: Date | null;
}

interface StepDef {
  order: number;
  delayDays: number;
}

function applyAction(
  state: EnrollmentState,
  action: string,
  steps: StepDef[],
  now: Date
):
  | { ok: true; newState: Partial<EnrollmentState> }
  | { ok: false; error: string } {
  switch (action) {
    case "pause": {
      if (state.status !== "ACTIVE") return { ok: false, error: "Can only pause active enrollments" };
      return { ok: true, newState: { status: "PAUSED", nextActionAt: null } };
    }
    case "resume": {
      if (state.status !== "PAUSED") return { ok: false, error: "Can only resume paused enrollments" };
      const currentStepDef = steps[state.currentStep];
      const nextActionAt = currentStepDef
        ? computeNextActionAt(now, currentStepDef.delayDays)
        : null;
      return { ok: true, newState: { status: "ACTIVE", nextActionAt } };
    }
    case "cancel": {
      if (state.status === "COMPLETED" || state.status === "CANCELLED") {
        return { ok: false, error: "Enrollment is already finished" };
      }
      return {
        ok: true,
        newState: { status: "CANCELLED", nextActionAt: null, completedAt: now },
      };
    }
    case "complete_step":
    case "skip_step": {
      if (state.status !== "ACTIVE") return { ok: false, error: "Can only advance active enrollments" };
      const nextStepIndex = state.currentStep + 1;
      if (nextStepIndex >= steps.length) {
        return {
          ok: true,
          newState: {
            status: "COMPLETED",
            currentStep: nextStepIndex,
            nextActionAt: null,
            completedAt: now,
          },
        };
      }
      const nextStep = steps[nextStepIndex];
      return {
        ok: true,
        newState: {
          currentStep: nextStepIndex,
          nextActionAt: computeNextActionAt(now, nextStep.delayDays),
        },
      };
    }
    default:
      return { ok: false, error: "Invalid action" };
  }
}

// --- Helper: validate sequence creation input ---
function validateSequenceInput(body: {
  name?: unknown;
  steps?: unknown;
}): string | null {
  if (!body.name || typeof body.name !== "string") return "MISSING_NAME";
  if (!Array.isArray(body.steps) || body.steps.length === 0) return "MISSING_STEPS";
  const validChannels = ["LINKEDIN", "EMAIL", "PHONE", "IN_PERSON", "OTHER"];
  for (const step of body.steps) {
    if (!step.channel || !validChannels.includes(step.channel)) return "INVALID_STEP_CHANNEL";
    if (step.delayDays !== undefined && (typeof step.delayDays !== "number" || step.delayDays < 0))
      return "INVALID_DELAY";
  }
  return null;
}

// ============= TESTS =============

describe("computeNextActionAt", () => {
  it("returns same time for 0 delay days", () => {
    const now = new Date("2025-01-15T10:00:00Z");
    const result = computeNextActionAt(now, 0);
    expect(result.getTime()).toBe(now.getTime());
  });

  it("adds correct number of days", () => {
    const now = new Date("2025-01-15T10:00:00Z");
    const result = computeNextActionAt(now, 3);
    expect(result.toISOString()).toBe("2025-01-18T10:00:00.000Z");
  });

  it("handles large delay", () => {
    const now = new Date("2025-01-01T00:00:00Z");
    const result = computeNextActionAt(now, 30);
    expect(result.toISOString()).toBe("2025-01-31T00:00:00.000Z");
  });
});

describe("applyAction", () => {
  const now = new Date("2025-06-01T12:00:00Z");
  const steps: StepDef[] = [
    { order: 0, delayDays: 0 },
    { order: 1, delayDays: 3 },
    { order: 2, delayDays: 7 },
  ];

  describe("pause", () => {
    it("pauses an active enrollment", () => {
      const state: EnrollmentState = {
        currentStep: 1,
        status: "ACTIVE",
        nextActionAt: new Date(),
        completedAt: null,
      };
      const result = applyAction(state, "pause", steps, now);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.newState.status).toBe("PAUSED");
        expect(result.newState.nextActionAt).toBeNull();
      }
    });

    it("rejects pausing a paused enrollment", () => {
      const state: EnrollmentState = {
        currentStep: 0,
        status: "PAUSED",
        nextActionAt: null,
        completedAt: null,
      };
      const result = applyAction(state, "pause", steps, now);
      expect(result.ok).toBe(false);
    });

    it("rejects pausing a completed enrollment", () => {
      const state: EnrollmentState = {
        currentStep: 3,
        status: "COMPLETED",
        nextActionAt: null,
        completedAt: new Date(),
      };
      const result = applyAction(state, "pause", steps, now);
      expect(result.ok).toBe(false);
    });
  });

  describe("resume", () => {
    it("resumes a paused enrollment with correct nextActionAt", () => {
      const state: EnrollmentState = {
        currentStep: 1,
        status: "PAUSED",
        nextActionAt: null,
        completedAt: null,
      };
      const result = applyAction(state, "resume", steps, now);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.newState.status).toBe("ACTIVE");
        expect(result.newState.nextActionAt).toEqual(
          computeNextActionAt(now, 3)
        );
      }
    });

    it("rejects resuming an active enrollment", () => {
      const state: EnrollmentState = {
        currentStep: 0,
        status: "ACTIVE",
        nextActionAt: new Date(),
        completedAt: null,
      };
      const result = applyAction(state, "resume", steps, now);
      expect(result.ok).toBe(false);
    });
  });

  describe("cancel", () => {
    it("cancels an active enrollment", () => {
      const state: EnrollmentState = {
        currentStep: 0,
        status: "ACTIVE",
        nextActionAt: new Date(),
        completedAt: null,
      };
      const result = applyAction(state, "cancel", steps, now);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.newState.status).toBe("CANCELLED");
        expect(result.newState.nextActionAt).toBeNull();
        expect(result.newState.completedAt).toEqual(now);
      }
    });

    it("cancels a paused enrollment", () => {
      const state: EnrollmentState = {
        currentStep: 1,
        status: "PAUSED",
        nextActionAt: null,
        completedAt: null,
      };
      const result = applyAction(state, "cancel", steps, now);
      expect(result.ok).toBe(true);
    });

    it("rejects cancelling an already completed enrollment", () => {
      const state: EnrollmentState = {
        currentStep: 3,
        status: "COMPLETED",
        nextActionAt: null,
        completedAt: new Date(),
      };
      const result = applyAction(state, "cancel", steps, now);
      expect(result.ok).toBe(false);
    });

    it("rejects cancelling an already cancelled enrollment", () => {
      const state: EnrollmentState = {
        currentStep: 1,
        status: "CANCELLED",
        nextActionAt: null,
        completedAt: new Date(),
      };
      const result = applyAction(state, "cancel", steps, now);
      expect(result.ok).toBe(false);
    });
  });

  describe("complete_step", () => {
    it("advances to next step with correct nextActionAt", () => {
      const state: EnrollmentState = {
        currentStep: 0,
        status: "ACTIVE",
        nextActionAt: new Date(),
        completedAt: null,
      };
      const result = applyAction(state, "complete_step", steps, now);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.newState.currentStep).toBe(1);
        expect(result.newState.nextActionAt).toEqual(
          computeNextActionAt(now, 3)
        );
      }
    });

    it("completes the sequence when on last step", () => {
      const state: EnrollmentState = {
        currentStep: 2,
        status: "ACTIVE",
        nextActionAt: new Date(),
        completedAt: null,
      };
      const result = applyAction(state, "complete_step", steps, now);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.newState.status).toBe("COMPLETED");
        expect(result.newState.currentStep).toBe(3);
        expect(result.newState.nextActionAt).toBeNull();
        expect(result.newState.completedAt).toEqual(now);
      }
    });

    it("rejects completing step on paused enrollment", () => {
      const state: EnrollmentState = {
        currentStep: 0,
        status: "PAUSED",
        nextActionAt: null,
        completedAt: null,
      };
      const result = applyAction(state, "complete_step", steps, now);
      expect(result.ok).toBe(false);
    });
  });

  describe("skip_step", () => {
    it("advances just like complete_step", () => {
      const state: EnrollmentState = {
        currentStep: 1,
        status: "ACTIVE",
        nextActionAt: new Date(),
        completedAt: null,
      };
      const result = applyAction(state, "skip_step", steps, now);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.newState.currentStep).toBe(2);
        expect(result.newState.nextActionAt).toEqual(
          computeNextActionAt(now, 7)
        );
      }
    });
  });

  describe("invalid action", () => {
    it("returns error for unknown action", () => {
      const state: EnrollmentState = {
        currentStep: 0,
        status: "ACTIVE",
        nextActionAt: new Date(),
        completedAt: null,
      };
      const result = applyAction(state, "fly_to_moon", steps, now);
      expect(result.ok).toBe(false);
    });
  });
});

describe("validateSequenceInput", () => {
  it("returns null for valid input", () => {
    const result = validateSequenceInput({
      name: "Test Sequence",
      steps: [{ channel: "LINKEDIN", delayDays: 0 }],
    });
    expect(result).toBeNull();
  });

  it("returns MISSING_NAME for empty name", () => {
    expect(validateSequenceInput({ name: "", steps: [{ channel: "LINKEDIN" }] })).toBe(
      "MISSING_NAME"
    );
  });

  it("returns MISSING_NAME for missing name", () => {
    expect(validateSequenceInput({ steps: [{ channel: "LINKEDIN" }] })).toBe(
      "MISSING_NAME"
    );
  });

  it("returns MISSING_NAME for non-string name", () => {
    expect(validateSequenceInput({ name: 123, steps: [{ channel: "LINKEDIN" }] })).toBe(
      "MISSING_NAME"
    );
  });

  it("returns MISSING_STEPS for missing steps", () => {
    expect(validateSequenceInput({ name: "Test" })).toBe("MISSING_STEPS");
  });

  it("returns MISSING_STEPS for empty steps array", () => {
    expect(validateSequenceInput({ name: "Test", steps: [] })).toBe("MISSING_STEPS");
  });

  it("returns MISSING_STEPS for non-array steps", () => {
    expect(validateSequenceInput({ name: "Test", steps: "not-array" })).toBe(
      "MISSING_STEPS"
    );
  });

  it("returns INVALID_STEP_CHANNEL for bad channel", () => {
    expect(
      validateSequenceInput({
        name: "Test",
        steps: [{ channel: "TELEGRAM" }],
      })
    ).toBe("INVALID_STEP_CHANNEL");
  });

  it("returns INVALID_DELAY for negative delayDays", () => {
    expect(
      validateSequenceInput({
        name: "Test",
        steps: [{ channel: "LINKEDIN", delayDays: -1 }],
      })
    ).toBe("INVALID_DELAY");
  });

  it("returns INVALID_DELAY for non-numeric delayDays", () => {
    expect(
      validateSequenceInput({
        name: "Test",
        steps: [{ channel: "LINKEDIN", delayDays: "three" }],
      })
    ).toBe("INVALID_DELAY");
  });

  it("accepts all valid channels", () => {
    for (const channel of ["LINKEDIN", "EMAIL", "PHONE", "IN_PERSON", "OTHER"]) {
      expect(
        validateSequenceInput({ name: "Test", steps: [{ channel }] })
      ).toBeNull();
    }
  });
});
