import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CostMeter } from "@/components/custom/cost-meter";
import { ProjectStatusBadge } from "@/components/custom/project-status-badge";

export const dynamic = "force-dynamic";

function fmtUsd(n: number) {
  return `USD ${Number(n ?? 0).toFixed(2)}`;
}

export default async function BillingPage() {
  const { profile } = await requireUser();
  const isAdmin = profile.role === "admin";
  const admin = createAdminClient();

  // Admin sees all projects; ingeniero_ia sees only their own (created or owned).
  let query = admin
    .from("projects")
    .select(
      "id, name, status, owner_id, created_by, claude_model, cost_usd, cost_cap_usd, is_cost_blocked, created_at",
    )
    .order("cost_usd", { ascending: false });

  if (!isAdmin) {
    query = query.or(`owner_id.eq.${profile.id},created_by.eq.${profile.id}`);
  }

  const { data: projects } = await query;
  const list = projects ?? [];

  const totalSpent = list.reduce((acc, p) => acc + Number(p.cost_usd ?? 0), 0);
  const totalCap = list.reduce(
    (acc, p) => acc + Number(p.cost_cap_usd ?? 0),
    0,
  );
  const blocked = list.filter((p) => p.is_cost_blocked).length;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Costos consolidados de todos los proyectos de la plataforma."
            : "Costos de los proyectos que creaste o tomaste."}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Gastado total
          </div>
          <div className="mt-1 text-2xl font-semibold">{fmtUsd(totalSpent)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            sobre {fmtUsd(totalCap)} disponibles
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Proyectos
          </div>
          <div className="mt-1 text-2xl font-semibold">{list.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            con tracking de costos
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Bloqueados por cap
          </div>
          <div className="mt-1 text-2xl font-semibold text-destructive">
            {blocked}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            requieren aprobación del owner
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead className="w-[260px]">Consumo</TableHead>
              <TableHead className="text-right">Gastado</TableHead>
              <TableHead className="text-right">Cap</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((p) => {
              const spent = Number(p.cost_usd ?? 0);
              const cap = Number(p.cost_cap_usd ?? 0);
              const pct = cap > 0 ? Math.round((spent / cap) * 100) : 0;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ProjectStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.claude_model}
                  </TableCell>
                  <TableCell>
                    <CostMeter used={spent} cap={cap} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {fmtUsd(spent)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {fmtUsd(cap)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        pct >= 80
                          ? "border-destructive/40 text-destructive"
                          : pct >= 50
                            ? "border-yellow-500/40 text-yellow-500"
                            : "border-green-500/40 text-green-500"
                      }
                    >
                      {pct}%
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {list.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No hay proyectos con costos registrados todavía.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
