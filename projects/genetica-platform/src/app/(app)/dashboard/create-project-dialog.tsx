"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLAUDE_MODELS, type ClaudeModel } from "@/lib/validations/projects";

export function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState<ClaudeModel>("claude-sonnet-4-6");
  const [files, setFiles] = useState<File[]>([]);

  function reset() {
    setModel("claude-sonnet-4-6");
    setFiles([]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("claude_model", model);
    // attach files
    fd.delete("files");
    files.forEach((f) => fd.append("files", f));

    const res = await fetch("/api/projects", { method: "POST", body: fd });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Proyecto creado");
      reset();
      onOpenChange(false);
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Error al crear");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear proyecto</DialogTitle>
          <DialogDescription>
            Definí nombre, modelo Claude y cap de costo. Subir archivos es opcional.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" minLength={3} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="claude_model">Modelo Claude</Label>
              <Select value={model} onValueChange={(v) => setModel(v as ClaudeModel)}>
                <SelectTrigger id="claude_model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLAUDE_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_cap_usd">Cap de costo (USD)</Label>
              <Input
                id="cost_cap_usd"
                name="cost_cap_usd"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={50}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Archivos (opcional)</Label>
            <label
              htmlFor="files"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              <Upload className="h-4 w-4" />
              Click para seleccionar archivos
            </label>
            <input
              id="files"
              type="file"
              multiple
              className="hidden"
              onChange={(e) =>
                setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])
              }
            />
            {files.length > 0 && (
              <ul className="space-y-1 text-xs">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between rounded border border-border/40 bg-muted/20 px-2 py-1"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
