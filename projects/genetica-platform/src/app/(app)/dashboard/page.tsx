import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProjectsGrid } from "./projects-grid";
import { ACTIVE_PROJECT_STATUSES } from "@/lib/validations/projects";
import type { ProjectCardData } from "@/components/custom/project-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { authId, profile } = await requireUser();
  const admin = createAdminClient();

  const { data: projects } = await admin
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const ownerIds = Array.from(
    new Set((projects ?? []).map((p) => p.owner_id).filter((v): v is string => !!v)),
  );
  const ownersMap = new Map<string, { id: string; full_name: string; email: string }>();
  if (ownerIds.length > 0) {
    const { data: owners } = await admin
      .from("users")
      .select("id, full_name, email")
      .in("id", ownerIds);
    for (const o of owners ?? []) ownersMap.set(o.id, o);
  }

  const enriched: ProjectCardData[] = (projects ?? []).map((p) => ({
    ...p,
    owner: p.owner_id ? ownersMap.get(p.owner_id) ?? null : null,
  }));

  const activeCount = enriched.filter((p) =>
    (ACTIVE_PROJECT_STATUSES as readonly string[]).includes(p.status),
  ).length;

  const { data: myQueueRows } = await admin
    .from("project_queue")
    .select("project_id, position, notified_at, expires_at")
    .eq("user_id", authId);

  const myQueue: Record<
    string,
    { position: number; notified_at: string | null; expires_at: string | null }
  > = {};
  for (const r of myQueueRows ?? []) {
    myQueue[r.project_id] = {
      position: r.position,
      notified_at: r.notified_at,
      expires_at: r.expires_at,
    };
  }

  const nowMs = Date.now();
  const notifiedTurns = (myQueueRows ?? [])
    .filter(
      (r) =>
        r.notified_at &&
        r.expires_at &&
        new Date(r.expires_at).getTime() > nowMs,
    )
    .map((r) => {
      const proj = enriched.find((p) => p.id === r.project_id);
      return {
        project_id: r.project_id,
        project_name: proj?.name ?? "Proyecto",
        expires_at: r.expires_at as string,
      };
    });

  return (
    <div className="container mx-auto p-6">
      <ProjectsGrid
        projects={enriched}
        currentUserId={authId}
        isAdmin={profile.role === "admin"}
        activeCount={activeCount}
        myQueue={myQueue}
        notifiedTurns={notifiedTurns}
        capFull={activeCount >= 20}
      />
    </div>
  );
}
