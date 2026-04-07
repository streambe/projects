import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Sliding window size for the chat context passed to Anthropic.
 * Older messages are expected to be captured in projects.context_summary.
 */
export const CONTEXT_WINDOW = 30;

export type AnthropicMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Loads the last CONTEXT_WINDOW messages for a project (ordered ASC, oldest
 * first) and the rolling summary stored on the projects row.
 *
 * System messages are skipped — the system prompt is injected separately.
 */
export async function loadContext(projectId: string): Promise<{
  messages: AnthropicMessage[];
  summary: string | null;
}> {
  const admin = createAdminClient();

  const [{ data: project }, { data: rows }] = await Promise.all([
    admin
      .from("projects")
      .select("context_summary")
      .eq("id", projectId)
      .single(),
    admin
      .from("project_messages")
      .select("role, content, content_sanitized, created_at")
      .eq("project_id", projectId)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: false })
      .limit(CONTEXT_WINDOW),
  ]);

  const ordered = (rows ?? []).slice().reverse();
  const messages: AnthropicMessage[] = ordered.map((r) => ({
    role: r.role === "assistant" ? "assistant" : "user",
    // Prefer the sanitized variant for assistant messages if present.
    content:
      r.role === "assistant" && r.content_sanitized
        ? r.content_sanitized
        : r.content,
  }));

  return {
    messages,
    summary: project?.context_summary ?? null,
  };
}

/**
 * TODO Sprint 6: implement rolling summary with Haiku.
 *
 * When there are >= 20 messages past the last summary_updated_at checkpoint,
 * summarize the messages older than CONTEXT_WINDOW into projects.context_summary
 * and bump summary_updated_at. For Sprint 5 we no-op.
 */
export async function maybeUpdateSummary(_projectId: string): Promise<void> {
  // TODO sprint 6
  return;
}
