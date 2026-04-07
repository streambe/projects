import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { advanceQueue, removeAndCompact } from "@/lib/queue/advance";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: expired } = await admin
    .from("project_queue")
    .select("id, project_id")
    .not("notified_at", "is", null)
    .lt("expires_at", nowIso);

  let removed = 0;
  let advanced = 0;

  for (const e of expired ?? []) {
    await removeAndCompact(e.id);
    removed++;
    const next = await advanceQueue(e.project_id);
    if (next) advanced++;
  }

  return NextResponse.json({ removed, advanced });
}

export const POST = GET;
