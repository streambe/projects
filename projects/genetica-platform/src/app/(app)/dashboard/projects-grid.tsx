"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProjectCard, type ProjectCardData } from "@/components/custom/project-card";
import { CreateProjectDialog } from "./create-project-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MAX_ACTIVE_PROJECTS } from "@/lib/validations/projects";

export type MyQueueMap = Record<
  string,
  { position: number; notified_at: string | null; expires_at: string | null }
>;

export type NotifiedTurn = {
  project_id: string;
  project_name: string;
  expires_at: string;
};

export function ProjectsGrid({
  projects,
  currentUserId,
  isAdmin,
  activeCount,
  myQueue = {},
  notifiedTurns = [],
  capFull = false,
}: {
  projects: ProjectCardData[];
  currentUserId: string;
  isAdmin: boolean;
  activeCount: number;
  myQueue?: MyQueueMap;
  notifiedTurns?: NotifiedTurn[];
  capFull?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const mine = useMemo(
    () => projects.filter((p) => p.owner_id === currentUserId),
    [projects, currentUserId],
  );
  const available = useMemo(
    () => projects.filter((p) => p.status === "available"),
    [projects],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo de proyectos GENTICA
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Crear proyecto
        </Button>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Capacidad de la plataforma</span>
          <span className="font-mono">
            <span
              className={
                activeCount >= MAX_ACTIVE_PROJECTS
                  ? "text-destructive"
                  : activeCount >= MAX_ACTIVE_PROJECTS * 0.8
                    ? "text-amber-400"
                    : "text-emerald-400"
              }
            >
              {activeCount}
            </span>
            <span className="text-muted-foreground"> / {MAX_ACTIVE_PROJECTS} activos</span>
          </span>
        </div>
      </div>

      {notifiedTurns.length > 0 && <YourTurnBanner turns={notifiedTurns} />}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos ({projects.length})</TabsTrigger>
          <TabsTrigger value="mine">Mis proyectos ({mine.length})</TabsTrigger>
          <TabsTrigger value="available">Disponibles ({available.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Grid items={projects} currentUserId={currentUserId} isAdmin={isAdmin} myQueue={myQueue} capFull={capFull} activeCount={activeCount} />
        </TabsContent>
        <TabsContent value="mine" className="mt-4">
          <Grid items={mine} currentUserId={currentUserId} isAdmin={isAdmin} myQueue={myQueue} capFull={capFull} activeCount={activeCount} />
        </TabsContent>
        <TabsContent value="available" className="mt-4">
          <Grid items={available} currentUserId={currentUserId} isAdmin={isAdmin} myQueue={myQueue} capFull={capFull} activeCount={activeCount} />
        </TabsContent>
      </Tabs>

      <CreateProjectDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function Grid({
  items,
  currentUserId,
  isAdmin,
  myQueue = {},
  capFull = false,
  activeCount = 0,
}: {
  items: ProjectCardData[];
  currentUserId: string;
  isAdmin: boolean;
  myQueue?: MyQueueMap;
  capFull?: boolean;
  activeCount?: number;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 px-6 py-12 text-center text-sm text-muted-foreground">
        No hay proyectos en esta vista.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          queueEntry={myQueue[p.id]}
          capFull={capFull}
        />
      ))}
    </div>
  );
}

function YourTurnBanner({ turns }: { turns: NotifiedTurn[] }) {
  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3">
      <div className="space-y-2">
        {turns.map((t) => (
          <YourTurnRow key={t.project_id} turn={t} />
        ))}
      </div>
    </div>
  );
}

function YourTurnRow({ turn }: { turn: NotifiedTurn }) {
  const [busy, setBusy] = useState(false);
  async function take() {
    setBusy(true);
    const res = await fetch(`/api/projects/${turn.project_id}/claim`, { method: "POST" });
    setBusy(false);
    if (res.ok) {
      window.location.href = `/projects/${turn.project_id}`;
    }
  }
  async function pass() {
    setBusy(true);
    await fetch(`/api/projects/${turn.project_id}/queue`, { method: "DELETE" });
    setBusy(false);
    window.location.reload();
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-amber-100">
        🎯 Tu turno en <strong>{turn.project_name}</strong> — hasta{" "}
        {new Date(turn.expires_at).toLocaleString("es-AR")}
      </span>
      <div className="flex gap-2">
        <Button size="sm" onClick={take} disabled={busy}>
          Tomar ahora
        </Button>
        <Button size="sm" variant="outline" onClick={pass} disabled={busy}>
          Pasar
        </Button>
      </div>
    </div>
  );
}
