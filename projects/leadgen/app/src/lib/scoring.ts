/**
 * Lead scoring system.
 *
 * Demographic score (0-40):  title + industry + company size + country
 * Behavioral score  (0-60):  activities performed by/on the lead
 *
 * Thresholds:
 *   0-19  COLD  | 20-39 WARM | 40-69 MQL | 70+ SQL
 */

import type { Lead, Company, Activity } from "@/types";
import { ActivityType } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScoreLabel = "COLD" | "WARM" | "MQL" | "SQL";

export interface ScoreResult {
  total: number;
  demographic: number;
  behavioral: number;
  label: ScoreLabel;
}

// ---------------------------------------------------------------------------
// Demographic helpers
// ---------------------------------------------------------------------------

const TITLE_SCORES: [RegExp, number][] = [
  [/\b(ceo|cto|cio|cfo|coo|vp|vice\s*president|founder|owner)\b/i, 15],
  [/\b(director)\b/i, 12],
  [/\b(gerente|manager|head)\b/i, 8],
];

const INDUSTRY_SCORES: Record<string, number> = {
  salud: 10,
  health: 10,
  healthcare: 10,
  tecnologia: 7,
  technology: 7,
  tech: 7,
  farma: 8,
  pharma: 8,
  pharmaceutical: 8,
};

const SIZE_SCORES: Record<string, number> = {
  ENTERPRISE: 10,
  LARGE: 8,
  MEDIUM: 6,
  SMALL: 3,
  STARTUP: 2,
};

const COUNTRY_SCORES: Record<string, number> = {
  argentina: 5,
  ar: 5,
};

const LATAM_COUNTRIES = new Set([
  "mexico",
  "mx",
  "colombia",
  "co",
  "chile",
  "cl",
  "peru",
  "pe",
  "uruguay",
  "uy",
  "paraguay",
  "py",
  "bolivia",
  "bo",
  "ecuador",
  "ec",
  "venezuela",
  "ve",
  "brasil",
  "brazil",
  "br",
  "costa rica",
  "cr",
  "panama",
  "pa",
]);

function scoreTitleDemographic(title?: string | null): number {
  if (!title) return 3;
  for (const [re, pts] of TITLE_SCORES) {
    if (re.test(title)) return pts;
  }
  return 3;
}

function scoreIndustry(industry?: string | null): number {
  if (!industry) return 3;
  const key = industry.toLowerCase().trim();
  return INDUSTRY_SCORES[key] ?? 3;
}

function scoreCompanySize(size?: string | null): number {
  if (!size) return 0;
  return SIZE_SCORES[size] ?? 0;
}

function scoreCountry(country?: string | null): number {
  if (!country) return 1;
  const key = country.toLowerCase().trim();
  if (COUNTRY_SCORES[key]) return COUNTRY_SCORES[key];
  if (LATAM_COUNTRIES.has(key)) return 3;
  return 1;
}

// ---------------------------------------------------------------------------
// Behavioral helpers
// ---------------------------------------------------------------------------

const ACTIVITY_POINTS: Partial<Record<ActivityType, number>> = {
  [ActivityType.LINKEDIN_CONNECT]: 10, // accepted connection
  [ActivityType.LINKEDIN_MESSAGE]: 15, // replied to message
  [ActivityType.EMAIL_SENT]: 5, // opened email (proxy)
  [ActivityType.LINKEDIN_VIEW]: 5, // visited profile
  [ActivityType.LINKEDIN_INMAIL]: 8, // click in link (proxy)
  [ActivityType.EMAIL_RECEIVED]: 15, // responded message
  [ActivityType.MEETING]: 15, // attended meeting
  [ActivityType.CALL]: 20, // requested info / meeting
};

function scoreBehavioral(activities?: Activity[]): number {
  if (!activities || activities.length === 0) return 0;
  let score = 0;
  for (const a of activities) {
    score += ACTIVITY_POINTS[a.type as ActivityType] ?? 0;
  }
  return Math.min(score, 60);
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

export function calculateScore(
  lead: Lead & { company?: Company | null; activities?: Activity[] }
): ScoreResult {
  const demographic = Math.min(
    40,
    scoreTitleDemographic(lead.title) +
      scoreIndustry(lead.company?.industry) +
      scoreCompanySize(lead.company?.size) +
      scoreCountry(lead.company?.country)
  );

  const behavioral = scoreBehavioral(lead.activities);

  const total = demographic + behavioral;

  let label: ScoreLabel;
  if (total >= 70) label = "SQL";
  else if (total >= 40) label = "MQL";
  else if (total >= 20) label = "WARM";
  else label = "COLD";

  return { total, demographic, behavioral, label };
}

// ---------------------------------------------------------------------------
// Label utilities
// ---------------------------------------------------------------------------

export function labelForScore(score: number): ScoreLabel {
  if (score >= 70) return "SQL";
  if (score >= 40) return "MQL";
  if (score >= 20) return "WARM";
  return "COLD";
}

export const SCORE_COLORS: Record<ScoreLabel, string> = {
  COLD: "bg-gray-400",
  WARM: "bg-amber-400",
  MQL: "bg-orange-500",
  SQL: "bg-red-500",
};

export const SCORE_TEXT_COLORS: Record<ScoreLabel, string> = {
  COLD: "text-gray-600",
  WARM: "text-amber-600",
  MQL: "text-orange-600",
  SQL: "text-red-600",
};
