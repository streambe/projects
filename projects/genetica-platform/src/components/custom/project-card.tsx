"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProjectStatusBadge } from "./project-status-badge";
import { CostMeter } from "./cost-meter";
import type { Tables } from "@/types/database";

type Project = Tables<"projects">;

export type ProjectCardData = Project & {
  owner?: { id: string; full_name: string; email: string } | null;
};

const MODEL_LABELS: Record<string, string> = {
  "claude-opus-4-6": "Opus 4.6",
  "claude-sonnet-4-6": "Sonnet 4.6",
  "claude-haiku-4-6": "Haiku 4.6",
  "claude-haiku-4-5": "Haiku 4.5",
};

export function ProjectCard({
  project,
  currentUserId,
  isAdmin,
  queueEntry,
  capFull = false,
}: {
  project: ProjectCardData;
  currentUserId: string;
  isAdmin: boolean;
  queueEntry?: { position: number; notified_at: string | null; expires_at: string | null };
  capFull?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const isOwner = project.owner_id === currentUserId;
  const canOpen = isOwner || isAdmin;
  const isAvailable = project.status === "available";

  function handleClaim(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const res = await fetch(`/api/projects/${project.id}/claim`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        if (json.queued) {
          toast.info(json.message ?? `En cola, posición ${json.position}`);
          router.refresh();
        } else {
          toast.success("Proyecto tomado");
          router.push(`/projects/${project.id}`);
          router.refresh();
        }
      } else if (res.status === 409) {
        toast.error(json.error ?? "Plataforma llena");
      } else {
        toast.error(json.error ?? "Error al tomar proyecto");
      }
    });
  }

  function handleLeaveQueue(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const res = await fetch(`/api/projects/${project.id}/queue`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Saliste de la cola");
        router.refresh();
      } else {
        toast.error("Error");
      }
    });
  }

  const cardBody = (
    <Card className="h-full transition-colors hover:border-primary/40">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold">{project.name}</h3>
          <ProjectStatusBadge status={project.status} />
        </div>
        <p className="line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
          {project.description ?? "Sin descripción"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Modelo</span>
          <span className="font-mono">
            {MODEL_LABELS[project.claude_model] ?? project.claude_model}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Owner</span>
          <span className="truncate">
            {project.owner ? (
              isOwner ? (
                <span className="text-primary">vos</span>
              ) : (
                project.owner.full_name
              )
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </span>
        </div>
        <CostMeter used={project.cost_usd} cap={project.cost_cap_usd} />

        <div className="pt-2">
          {canOpen ? (
            <Button asChild size="sm" className="w-full">
              <Link href={`/projects/${project.id}`}>
                Abrir <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : queueEntry ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" disabled>
                En cola (#{queueEntry.position})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLeaveQueue}
                disabled={pending}
              >
                Salir
              </Button>
            </div>
          ) : isAvailable && !capFull ? (
            <Button
              size="sm"
              className="w-full"
              onClick={handleClaim}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Hand className="h-3.5 w-3.5" />
              )}
              Tomar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleClaim}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Hand className="h-3.5 w-3.5" />
              )}
              Entrar en cola
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return cardBody;
}
