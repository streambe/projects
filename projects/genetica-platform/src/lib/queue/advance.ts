import { createAdminClient } from "@/lib/supabase/admin";

const NOTIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Advances the FIFO queue for a project: picks the entry with the lowest
 * position and marks it as notified (24h to claim manually).
 *
 * Idempotent: if the head entry is already notified and not expired,
 * does nothing. Returns the notified entry, or null if the queue is empty.
 */
export async function advanceQueue(projectId: string) {
  const admin = createAdminClient();

  const { data: head } = await admin
    .from("project_queue")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!head) return null;

  // If head is already notified and still valid, leave it as is.
  if (head.notified_at && head.expires_at && new Date(head.expires_at) > new Date()) {
    return head;
  }

  const now = new Date();
  const expires = new Date(now.getTime() + NOTIFICATION_TTL_MS);

  const { data: updated } = await admin
    .from("project_queue")
    .update({
      notified_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })
    .eq("id", head.id)
    .select()
    .single();

  return updated ?? null;
}

/**
 * Removes a queue entry by id and re-numbers the remaining positions
 * for that project so they stay contiguous starting at 1.
 */
export async function removeAndCompact(queueId: string) {
  const admin = createAdminClient();

  const { data: entry } = await admin
    .from("project_queue")
    .select("project_id")
    .eq("id", queueId)
    .maybeSingle();

  if (!entry) return;

  await admin.from("project_queue").delete().eq("id", queueId);

  const { data: rest } = await admin
    .from("project_queue")
    .select("id")
    .eq("project_id", entry.project_id)
    .order("position", { ascending: true });

  if (!rest) return;
  let pos = 1;
  for (const r of rest) {
    await admin.from("project_queue").update({ position: pos }).eq("id", r.id);
    pos++;
  }
}
