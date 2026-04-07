import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "@/components/custom/project-status-badge";
import { CostMeter } from "@/components/custom/cost-meter";
import {
  ClaimButton,
  ReleaseButton,
  UploadFilesButton,
  DeleteFileButton,
} from "./project-actions";
import { ChatPanel } from "./chat-panel";

export const dynamic = "force-dynamic";

const MODEL_LABELS: Record<string, string> = {
  "claude-opus-4-6": "Claude Opus 4.6",
  "claude-sonnet-4-6": "Claude Sonnet 4.6",
  "claude-haiku-4-6": "Claude Haiku 4.6",
  "claude-haiku-4-5": "Claude Haiku 4.5",
};

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { authId, profile } = await requireUser();
  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const isAdmin = profile.role === "admin";
  const isOwner = project.owner_id === authId;
  const canEdit = isAdmin || isOwner;
  const isAvailable = project.status === "available";

  let owner: { id: string; full_name: string; email: string } | null = null;
  if (project.owner_id) {
    const { data } = await admin
      .from("users")
      .select("id, full_name, email")
      .eq("id", project.owner_id)
      .single();
    owner = data ?? null;
  }

  const { data: files } = await admin
    .from("project_files")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  let queueEntries: Array<{
    id: string;
    position: number;
    notified_at: string | null;
    expires_at: string | null;
    user: { full_name: string; email: string } | null;
  }> = [];
  if (canEdit) {
    const { data: q } = await admin
      .from("project_queue")
      .select("*")
      .eq("project_id", id)
      .order("position", { ascending: true });
    const uids = Array.from(new Set((q ?? []).map((r) => r.user_id)));
    const map = new Map<string, { full_name: string; email: string }>();
    if (uids.length) {
      const { data: us } = await admin
        .from("users")
        .select("id, full_name, email")
        .in("id", uids);
      for (const u of us ?? []) map.set(u.id, { full_name: u.full_name, email: u.email });
    }
    queueEntries = (q ?? []).map((r) => ({
      id: r.id,
      position: r.position,
      notified_at: r.notified_at,
      expires_at: r.expires_at,
      user: map.get(r.user_id) ?? null,
    }));
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="max-w-2xl text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {isAvailable && !isOwner && <ClaimButton projectId={project.id} />}
          {canEdit && project.status === "owned" && <ReleaseButton projectId={project.id} />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Row label="Estado">
              <ProjectStatusBadge status={project.status} />
            </Row>
            <Row label="Modelo">
              <span className="font-mono text-xs">
                {MODEL_LABELS[project.claude_model] ?? project.claude_model}
              </span>
            </Row>
            <Row label="Owner">
              <span>
                {owner ? (
                  <>
                    {owner.full_name}
                    {isOwner && <span className="ml-1 text-primary">(vos)</span>}
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
            </Row>
            <Separator />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Costo acumulado</div>
              <CostMeter used={project.cost_usd} cap={project.cost_cap_usd} />
            </div>
            {project.is_cost_blocked && (
              <div className="rounded border border-destructive/50 bg-destructive/10 px-2 py-1 text-xs text-destructive">
                Bloqueado por exceder el cap de costo.
              </div>
            )}
            <Separator />
            <Row label="Creado">
              <span className="text-xs text-muted-foreground">
                {new Date(project.created_at).toLocaleString("es-AR")}
              </span>
            </Row>
            {project.owned_at && (
              <Row label="Tomado">
                <span className="text-xs text-muted-foreground">
                  {new Date(project.owned_at).toLocaleString("es-AR")}
                </span>
              </Row>
            )}
          </CardContent>
        </Card>

        {/* Chat zone (placeholder) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Chat con el equipo GEN</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatPanel
              projectId={project.id}
              canEdit={canEdit}
              isBlocked={project.is_cost_blocked}
              currentCap={project.cost_cap_usd}
            />
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cola de espera ({queueEntries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {queueEntries.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nadie en la cola.
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {queueEntries.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">#{q.position}</span>
                      <span>{q.user?.full_name ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{q.user?.email}</span>
                    </div>
                    {q.notified_at && q.expires_at && (
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                        Notificado · expira {new Date(q.expires_at).toLocaleString("es-AR")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Archivos ({files?.length ?? 0})</CardTitle>
          {canEdit && <UploadFilesButton projectId={project.id} />}
        </CardHeader>
        <CardContent>
          {files && files.length > 0 ? (
            <ul className="divide-y divide-border/40">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-4 py-2 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{f.filename}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatBytes(f.size_bytes)}</span>
                    <span>{new Date(f.created_at).toLocaleDateString("es-AR")}</span>
                    {canEdit && (
                      <DeleteFileButton projectId={project.id} fileId={f.id} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sin archivos.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <div>{children}</div>
    </div>
  );
}
