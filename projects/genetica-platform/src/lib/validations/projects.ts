import { z } from "zod";

export const ClaudeModelEnum = z.enum([
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "claude-haiku-4-6",
  "claude-haiku-4-5",
]);

export type ClaudeModel = z.infer<typeof ClaudeModelEnum>;

export const CLAUDE_MODELS: { value: ClaudeModel; label: string }[] = [
  { value: "claude-opus-4-6", label: "Claude Opus 4.6" },
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { value: "claude-haiku-4-6", label: "Claude Haiku 4.6" },
  { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
];

export const CreateProjectSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres").max(120),
  description: z.string().max(2000).optional().nullable(),
  claude_model: ClaudeModelEnum.default("claude-sonnet-4-6"),
  cost_cap_usd: z.coerce.number().positive("Debe ser > 0").max(10000).default(50),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const ACTIVE_PROJECT_STATUSES = ["owned", "blocked"] as const;
export const MAX_ACTIVE_PROJECTS = 20;
