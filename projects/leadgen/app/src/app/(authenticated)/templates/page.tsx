"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Link,
  Mail,
  Phone,
  User,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/hooks/use-templates";
import { Channel } from "@/types";
import type { Template } from "@/types";

const CHANNEL_CONFIG: Record<
  string,
  { label: string; icon: typeof Mail; color: string }
> = {
  LINKEDIN: {
    label: "LinkedIn",
    icon: Link,
    color: "bg-sky-100 text-sky-700 border-sky-200",
  },
  EMAIL: {
    label: "Email",
    icon: Mail,
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  PHONE: {
    label: "Telefono",
    icon: Phone,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  IN_PERSON: {
    label: "Presencial",
    icon: User,
    color: "bg-violet-100 text-violet-700 border-violet-200",
  },
  OTHER: {
    label: "Otro",
    icon: FileText,
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const VARIABLE_HINTS = [
  { var: "{{nombre}}", desc: "Nombre del lead" },
  { var: "{{apellido}}", desc: "Apellido del lead" },
  { var: "{{empresa}}", desc: "Empresa del lead" },
  { var: "{{cargo}}", desc: "Cargo del lead" },
  { var: "{{industria}}", desc: "Industria de la empresa" },
];

interface TemplateFormData {
  name: string;
  channel: string;
  subject: string;
  content: string;
}

const EMPTY_FORM: TemplateFormData = {
  name: "",
  channel: "LINKEDIN",
  subject: "",
  content: "",
};

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState<TemplateFormData>(EMPTY_FORM);

  function openCreate() {
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  }

  function openEdit(t: Template) {
    setForm({
      name: t.name,
      channel: t.channel,
      subject: t.subject ?? "",
      content: t.content,
    });
    setEditTemplate(t);
  }

  async function handleCreate() {
    await createMutation.mutateAsync({
      name: form.name,
      channel: form.channel,
      subject: form.channel === "EMAIL" ? form.subject : undefined,
      content: form.content,
    });
    setCreateOpen(false);
  }

  async function handleUpdate() {
    if (!editTemplate) return;
    await updateMutation.mutateAsync({
      id: editTemplate.id,
      name: form.name,
      channel: form.channel,
      subject: form.channel === "EMAIL" ? form.subject : undefined,
      content: form.content,
    });
    setEditTemplate(null);
  }

  async function handleDelete() {
    if (!deleteTemplate) return;
    await deleteMutation.mutateAsync(deleteTemplate.id);
    setDeleteTemplate(null);
  }

  const isFormValid = form.name.trim() && form.content.trim();

  const isEmpty = !isLoading && (!templates || templates.length === 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[#141414]">
            Plantillas
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Plantillas de mensaje para secuencias de outreach.
          </p>
        </div>
        {!isEmpty && (
          <Button
            onClick={openCreate}
            className="rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs gap-1.5 shadow-md hover:-translate-y-px transition-all duration-200"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva Plantilla
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-[18px] border-[rgba(0,0,0,0.05)] animate-pulse">
              <CardContent className="p-5 space-y-3">
                <div className="h-4 bg-[#F5F7FF] rounded-xl w-2/3" />
                <div className="h-3 bg-[#F5F7FF] rounded-xl w-1/3" />
                <div className="h-16 bg-[#F5F7FF] rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <Card className="rounded-[18px] border border-dashed border-[#E8EBFF]">
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F7FF] mb-4">
              <FileText className="h-6 w-6 text-[#3957ED]" />
            </div>
            <p className="text-sm font-semibold text-[#141414]">
              No hay plantillas
            </p>
            <p className="text-xs text-[#999999] mt-1 max-w-xs mx-auto">
              Crea tu primera plantilla de mensaje para usar en secuencias de
              outreach.
            </p>
            <Button
              onClick={openCreate}
              className="mt-4 rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs shadow-md hover:-translate-y-px transition-all duration-200"
              size="sm"
            >
              Crear Plantilla
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template grid */}
      {!isLoading && templates && templates.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => {
            const cfg = CHANNEL_CONFIG[t.channel] ?? CHANNEL_CONFIG.OTHER;
            const Icon = cfg.icon;
            return (
              <Card
                key={t.id}
                className="rounded-[18px] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] hover:-translate-y-px transition-all duration-200 group"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#141414] truncate">
                        {t.name}
                      </p>
                      {t.subject && (
                        <p className="text-xs text-[#666666] truncate mt-0.5">
                          Asunto: {t.subject}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => openEdit(t)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTemplate(t)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium gap-1 ${cfg.color}`}
                  >
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </Badge>

                  <p className="text-xs text-[#666666] leading-relaxed line-clamp-3 whitespace-pre-wrap">
                    {t.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <TemplateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nueva Plantilla"
        description="Crea una plantilla de mensaje reutilizable para tus secuencias."
        form={form}
        setForm={setForm}
        onSubmit={handleCreate}
        submitLabel="Crear"
        isPending={createMutation.isPending}
        isValid={!!isFormValid}
      />

      {/* Edit Dialog */}
      <TemplateDialog
        open={!!editTemplate}
        onOpenChange={(open) => {
          if (!open) setEditTemplate(null);
        }}
        title="Editar Plantilla"
        description="Modifica los datos de la plantilla."
        form={form}
        setForm={setForm}
        onSubmit={handleUpdate}
        submitLabel="Guardar"
        isPending={updateMutation.isPending}
        isValid={!!isFormValid}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTemplate}
        onOpenChange={(open) => {
          if (!open) setDeleteTemplate(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-[#141414]">
              Eliminar Plantilla
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666666]">
              Esta accion no se puede deshacer. Se eliminara permanentemente la
              plantilla{" "}
              <span className="font-semibold text-[#141414]">
                {deleteTemplate?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setDeleteTemplate(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Shared form dialog ─── */

function TemplateDialog({
  open,
  onOpenChange,
  title,
  description,
  form,
  setForm,
  onSubmit,
  submitLabel,
  isPending,
  isValid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  form: TemplateFormData;
  setForm: React.Dispatch<React.SetStateAction<TemplateFormData>>;
  onSubmit: () => void;
  submitLabel: string;
  isPending: boolean;
  isValid: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-[#141414]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#666666]">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#666666]">
              Nombre
            </Label>
            <Input
              placeholder="Ej: Primer contacto LinkedIn"
              className="text-xs"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>

          {/* Channel */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#666666]">Canal</Label>
            <Select
              value={form.channel || "LINKEDIN"}
              onValueChange={(v) => v && setForm((f) => ({ ...f, channel: v }))}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CHANNEL_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <SelectItem key={key} value={key} className="text-xs">
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Subject (email only) */}
          {form.channel === "EMAIL" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#666666]">
                Asunto
              </Label>
              <Input
                placeholder="Ej: {{nombre}}, una oportunidad para {{empresa}}"
                className="text-xs"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
            </div>
          )}

          {/* Content */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#666666]">
              Contenido
            </Label>
            <Textarea
              placeholder="Hola {{nombre}}, vi que trabajas en {{empresa}} como {{cargo}}..."
              className="text-xs min-h-[120px] resize-y"
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
            />
          </div>

          {/* Variable hints */}
          <div className="rounded-xl bg-[#F5F7FF] border border-[#E8EBFF] p-3">
            <p className="text-[10px] font-medium text-[#999999] uppercase tracking-wider mb-2">
              Variables disponibles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {VARIABLE_HINTS.map((v) => (
                <button
                  key={v.var}
                  type="button"
                  className="inline-flex items-center rounded-full bg-white border border-[#E8EBFF] px-2 py-0.5 text-[11px] text-[#666666] hover:bg-[#F5F7FF] hover:border-[#3957ED]/30 transition-all duration-200 cursor-pointer"
                  title={v.desc}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      content: f.content + v.var,
                    }))
                  }
                >
                  {v.var}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs shadow-md hover:-translate-y-px transition-all duration-200"
            onClick={onSubmit}
            disabled={isPending || !isValid}
          >
            {isPending ? "Guardando..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
