import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  owned: "Tomado",
  queued: "En cola",
  archived: "Archivado",
  blocked: "Bloqueado",
};

const STATUS_CLASSES: Record<string, string> = {
  available: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  owned: "border-primary/50 text-primary bg-primary/10",
  queued: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  archived: "border-muted-foreground/30 text-muted-foreground bg-muted/20",
  blocked: "border-destructive/50 text-destructive bg-destructive/10",
};

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_CLASSES[status] ?? "", "font-medium", className)}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
