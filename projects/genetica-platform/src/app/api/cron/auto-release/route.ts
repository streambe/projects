import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { advanceQueue } from "@/lib/queue/advance";
import { ACTIVE_PROJECT_STATUSES } from "@/lib/validations/projects";

const INACTIVITY_DAYS = 7;

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return unauthorized();
  }

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: stale } = await admin
    .from("projects")
    .select("id, owner_id, last_interaction_at")
    .in("status", ACTIVE_PROJECT_STATUSES as unknown as string[])
    .lt("last_interaction_at", cutoff);

  let released = 0;
  let queueAdvanced = 0;

  for (const p of stale ?? []) {
    const { data: updated } = await admin
      .from("projects")
      .update({
        status: "available",
        owner_id: null,
        owned_at: null,
      })
      .eq("id", p.id)
      .select("id")
      .single();

    if (!updated) continue;
    released++;

    if (p.owner_id) {
      await admin.from("ownership_history").insert({
        project_id: p.id,
        user_id: p.owner_id,
        action: "auto_release",
        reason: `Inactivity > ${INACTIVITY_DAYS} days`,
      });
    }

    const notified = await advanceQueue(p.id);
    if (notified) queueAdvanced++;
  }

  return NextResponse.json({ released, queue_advanced: queueAdvanced });
}

export const POST = GET;
