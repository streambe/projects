import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Anthropic SDK instance. Reads ANTHROPIC_API_KEY from env.
 * Used by the gen-engine to stream PM responses and (soon) summaries.
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Back-compat factory for legacy imports.
 */
export function createAnthropicClient() {
  return anthropic;
}

/**
 * Pricing in USD per 1M tokens. Keep in sync with Anthropic public pricing.
 * Values: [inputPerMTok, outputPerMTok]
 */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4-6": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-6": { input: 1, output: 5 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

/**
 * Public slug → SDK model id. We keep them 1:1 today but the mapping lives
 * here so we can rename or alias models without touching call sites.
 */
const MODEL_IDS: Record<string, string> = {
  "claude-opus-4-6": "claude-opus-4-6",
  "claude-sonnet-4-6": "claude-sonnet-4-6",
  "claude-haiku-4-6": "claude-haiku-4-6",
  "claude-haiku-4-5": "claude-haiku-4-5",
};

export function getModelId(slug: string): string {
  return MODEL_IDS[slug] ?? slug;
}

/**
 * Computes USD cost for a given model and token usage.
 * Returns 0 for unknown models so we never crash on new SKUs — but logs a warn.
 */
export function calculateCost(
  model: string,
  tokensIn: number,
  tokensOut: number,
): number {
  const p = MODEL_PRICING[model];
  if (!p) {
    console.warn(`[anthropic] unknown model for pricing: ${model}`);
    return 0;
  }
  const cost = (tokensIn * p.input + tokensOut * p.output) / 1_000_000;
  // Round to 6 decimals to keep the ledger clean.
  return Math.round(cost * 1_000_000) / 1_000_000;
}

/**
 * Default fallback model if a project has no claude_model set.
 */
export const DEFAULT_MODEL = "claude-sonnet-4-6";
