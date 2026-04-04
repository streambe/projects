"use client";

import { useState } from "react";
import { useSequences, useDeleteSequence } from "@/hooks/use-sequences";
import { useTemplates } from "@/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { SequenceFormDialog } from "@/components/sequences/sequence-form-dialog";

export default function SequencesPage() {
  const { data: sequences, isLoading } = useSequences();
  const { data: templates } = useTemplates();
  const deleteSequence = useDeleteSequence();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = (id: string, name: string, activeCount: number) => {
    if (activeCount > 0) {
      toast.error("No se puede eliminar una secuencia con enrollments activos");
      return;
    }
    if (!confirm(`Eliminar secuencia "${name}"?`)) return;
    deleteSequence.mutate(id, {
      onSuccess: () => toast.success("Secuencia eliminada"),
      onError: (err) => toast.error(err.message),
    });
  };

  const channelLabel = (ch: string) => {
    switch (ch) {
      case "LINKEDIN": return "LinkedIn";
      case "EMAIL": return "Email";
      case "PHONE": return "Telefono";
      default: return ch;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[#141414]">Secuencias</h1>
          <p className="text-xs text-[#666666] mt-1">
            Gestiona tus secuencias de outreach automatizadas.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs shadow-md hover:-translate-y-px transition-all duration-200" size="sm">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nueva Secuencia
        </Button>
      </div>

      {isLoading && <p className="text-xs text-[#999999]">Cargando...</p>}

      {sequences && sequences.length === 0 && (
        <Card className="rounded-[18px] border border-dashed border-[#E8EBFF]">
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F7FF] mb-4">
              <Zap className="h-6 w-6 text-[#3957ED]" />
            </div>
            <p className="text-sm font-semibold text-[#141414]">No hay secuencias</p>
            <p className="text-xs text-[#999999] mt-1">
              Crea tu primera secuencia de outreach.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sequences?.map((seq) => (
          <Card key={seq.id} className="rounded-[18px] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] hover:-translate-y-px">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-bold text-[#141414]">{seq.name}</CardTitle>
                <Badge variant={seq.isActive ? "default" : "secondary"} className="rounded-full">
                  {seq.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              {seq.description && (
                <p className="text-sm text-[#666666]">{seq.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
              <div className="flex items-center gap-4 text-sm text-[#666666]">
                <span>{seq.steps.length} pasos</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {seq._count.enrollments} activos
                </span>
              </div>

              <div className="space-y-1">
                {seq.steps.slice(0, 4).map((step, i) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-2 text-xs text-[#666666]"
                  >
                    <span className="font-mono w-5 text-right text-[#999999]">{i + 1}.</span>
                    <Badge variant="outline" className="text-xs rounded-full border-[#E8EBFF]">
                      {channelLabel(step.channel)}
                    </Badge>
                    <span>
                      {step.delayDays > 0 ? `+${step.delayDays}d` : "Inmediato"}
                    </span>
                  </div>
                ))}
                {seq.steps.length > 4 && (
                  <p className="text-xs text-[#999999] pl-7">
                    +{seq.steps.length - 4} pasos mas
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#E8EBFF] text-[#3957ED] hover:bg-[#F5F7FF] transition-all duration-200"
                  onClick={() => setEditingId(seq.id)}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#E8EBFF] text-[#666666] hover:bg-[#F5F7FF] transition-all duration-200"
                  onClick={() =>
                    handleDelete(seq.id, seq.name, seq._count.enrollments)
                  }
                  disabled={deleteSequence.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showCreate && (
        <SequenceFormDialog
          templates={templates || []}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editingId && (
        <SequenceFormDialog
          sequenceId={editingId}
          templates={templates || []}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
