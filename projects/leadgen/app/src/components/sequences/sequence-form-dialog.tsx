"use client";

import { useState, useEffect } from "react";
import {
  useSequence,
  useCreateSequence,
  useUpdateSequence,
  type CreateSequenceInput,
} from "@/hooks/use-sequences";
import type { Template } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface StepDraft {
  channel: string;
  templateId: string;
  delayDays: number;
  subject: string;
  content: string;
}

const emptyStep: StepDraft = {
  channel: "LINKEDIN",
  templateId: "",
  delayDays: 0,
  subject: "",
  content: "",
};

interface Props {
  sequenceId?: string;
  templates: Template[];
  onClose: () => void;
}

export function SequenceFormDialog({ sequenceId, templates, onClose }: Props) {
  const { data: existingSequence } = useSequence(sequenceId);
  const createMutation = useCreateSequence();
  const updateMutation = useUpdateSequence();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<StepDraft[]>([{ ...emptyStep }]);

  useEffect(() => {
    if (existingSequence) {
      setName(existingSequence.name);
      setDescription(existingSequence.description || "");
      setSteps(
        existingSequence.steps.map((s) => ({
          channel: s.channel,
          templateId: s.templateId || "",
          delayDays: s.delayDays,
          subject: s.subject || "",
          content: s.content || "",
        }))
      );
    }
  }, [existingSequence]);

  const addStep = () => setSteps([...steps, { ...emptyStep }]);

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const copy = [...steps];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
    setSteps(copy);
  };

  const updateStep = (index: number, field: keyof StepDraft, value: string | number) => {
    const copy = [...steps];
    copy[index] = { ...copy[index], [field]: value };
    setSteps(copy);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (steps.length === 0) {
      toast.error("Agrega al menos un paso");
      return;
    }

    const payload: CreateSequenceInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      steps: steps.map((s) => ({
        channel: s.channel,
        templateId: s.templateId || undefined,
        delayDays: s.delayDays,
        subject: s.subject || undefined,
        content: s.content || undefined,
      })),
    };

    if (sequenceId) {
      updateMutation.mutate(
        { id: sequenceId, ...payload },
        {
          onSuccess: () => {
            toast.success("Secuencia actualizada");
            onClose();
          },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Secuencia creada");
          onClose();
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {sequenceId ? "Editar Secuencia" : "Nueva Secuencia"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seq-name">Nombre</Label>
            <Input
              id="seq-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Conexión Fría - Sector Salud"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seq-desc">Descripción</Label>
            <Textarea
              id="seq-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Pasos</Label>
              <Button variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Agregar paso
              </Button>
            </div>

            {steps.map((step, index) => (
              <div
                key={index}
                className="border border-[#E8EBFF] rounded-xl p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Paso {index + 1}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(index, 1)}
                      disabled={index === steps.length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      disabled={steps.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Canal</Label>
                    <Select
                      value={step.channel}
                      onValueChange={(v) => { if (v) updateStep(index, "channel", v); }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LINKEDIN">LinkedIn Message</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Delay (días)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={step.delayDays}
                      onChange={(e) =>
                        updateStep(index, "delayDays", Math.max(0, parseInt(e.target.value) || 0))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Template</Label>
                  <Select
                    value={step.templateId || "none"}
                    onValueChange={(v) => {
                      if (v !== null) updateStep(index, "templateId", v === "none" ? "" : v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin template</SelectItem>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!step.templateId && (
                  <div className="space-y-1">
                    <Label className="text-xs">Contenido custom</Label>
                    <Textarea
                      value={step.content}
                      onChange={(e) =>
                        updateStep(index, "content", e.target.value)
                      }
                      placeholder="Usa {{nombre}}, {{empresa}}, etc."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending
                ? "Guardando..."
                : sequenceId
                  ? "Actualizar"
                  : "Crear Secuencia"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
