import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: entries } = await admin
    .from("project_queue")
    .select("*")
    .eq("user_id", user.id)
    .order("enqueued_at", { ascending: true });

  const projectIds = Array.from(new Set((entries ?? []).map((e) => e.project_id)));
  const projectsMap = new Map<string, { id: string; name: string; status: string }>();
  if (projectIds.length > 0) {
    const { data: projects } = await admin
      .from("projects")
      .select("id, name, status")
      .in("id", projectIds);
    for (const p of projects ?? []) projectsMap.set(p.id, p);
  }

  const enriched = (entries ?? []).map((e) => ({
    ...e,
    project: projectsMap.get(e.project_id) ?? null,
  }));

  return NextResponse.json({ data: enriched });
}
