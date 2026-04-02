"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Search,
  Plus,
  ClipboardCopy,
  Trash2,
  BarChart3,
  Pencil,
  ToggleLeft,
  ToggleRight,
  FileQuestion,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Survey {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    responses: number;
    questions: number;
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function SurveysPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Survey | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSurveys = async () => {
    try {
      const res = await fetch("/api/surveys");
      if (!res.ok) throw new Error("Error al cargar encuestas");
      const data = await res.json();
      setSurveys(data);
    } catch {
      toast.error("No se pudieron cargar las encuestas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const filtered = useMemo(
    () =>
      surveys.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase())
      ),
    [surveys, search]
  );

  const handleToggle = async (survey: Survey) => {
    try {
      const res = await fetch(`/api/surveys/${survey.id}/toggle`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error();
      setSurveys((prev) =>
        prev.map((s) =>
          s.id === survey.id ? { ...s, isActive: !s.isActive } : s
        )
      );
      toast.success(
        survey.isActive ? "Encuesta desactivada" : "Encuesta activada"
      );
    } catch {
      toast.error("No se pudo cambiar el estado");
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/surveys/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setSurveys((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success("Encuesta eliminada");
    } catch {
      toast.error("No se pudo eliminar la encuesta");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  // Empty state
  if (surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 rounded-full bg-neutral-100 p-4">
          <FileQuestion className="h-10 w-10 text-neutral-400" />
        </div>
        <h2 className="mb-1 text-lg font-semibold text-neutral-900">
          No tenes encuestas todavia
        </h2>
        <p className="mb-6 text-sm text-neutral-500">
          Crea tu primera encuesta para empezar a recolectar respuestas.
        </p>
        <Button render={<Link href="/surveys/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Crear primera encuesta
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Encuestas</h1>
        <Button size="sm" render={<Link href="/surveys/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva encuesta
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Buscar encuestas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha creacion</TableHead>
              <TableHead className="text-right">Respuestas</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell className="font-medium">{survey.title}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleToggle(survey)}
                    className="cursor-pointer"
                  >
                    <Badge
                      variant={survey.isActive ? "default" : "secondary"}
                      className={
                        survey.isActive
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      }
                    >
                      {survey.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell className="text-neutral-500">
                  {formatDate(survey.createdAt)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {survey._count.responses}
                </TableCell>
                <TableCell>
                  <SurveyActions
                    survey={survey}
                    onToggle={() => handleToggle(survey)}
                    onCopyLink={() => handleCopyLink(survey.slug)}
                    onDelete={() => setDeleteTarget(survey)}
                    router={router}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-neutral-500"
                >
                  No se encontraron encuestas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((survey) => (
          <Card key={survey.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                {survey.title}
              </CardTitle>
              <SurveyActions
                survey={survey}
                onToggle={() => handleToggle(survey)}
                onCopyLink={() => handleCopyLink(survey.slug)}
                onDelete={() => setDeleteTarget(survey)}
                router={router}
              />
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <button
                type="button"
                onClick={() => handleToggle(survey)}
                className="cursor-pointer"
              >
                <Badge
                  variant={survey.isActive ? "default" : "secondary"}
                  className={
                    survey.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-100 text-neutral-500"
                  }
                >
                  {survey.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </button>
              <span>{formatDate(survey.createdAt)}</span>
              <span>{survey._count.responses} respuestas</span>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-neutral-500">
            No se encontraron encuestas
          </p>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar encuesta</DialogTitle>
            <DialogDescription>
              Vas a eliminar &ldquo;{deleteTarget?.title}&rdquo;. Esta accion no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SurveyActions({
  survey,
  onToggle,
  onCopyLink,
  onDelete,
  router,
}: {
  survey: Survey;
  onToggle: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8" />
        }
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Acciones</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/surveys/${survey.id}/results`)}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Ver resultados
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/surveys/${survey.id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyLink}>
          <ClipboardCopy className="mr-2 h-4 w-4" />
          Copiar link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggle}>
          {survey.isActive ? (
            <ToggleLeft className="mr-2 h-4 w-4" />
          ) : (
            <ToggleRight className="mr-2 h-4 w-4" />
          )}
          {survey.isActive ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
