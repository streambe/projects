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
      case "PHONE": return "Teléfono";
      default: return ch;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Secuencias</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus secuencias de outreach automatizadas.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Secuencia
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Cargando...</p>}

      {sequences && sequences.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No hay secuencias</p>
            <p className="text-muted-foreground mt-1">
              Crea tu primera secuencia de outreach.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sequences?.map((seq) => (
          <Card key={seq.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{seq.name}</CardTitle>
                <Badge variant={seq.isActive ? "default" : "secondary"}>
                  {seq.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              {seq.description && (
                <p className="text-sm text-muted-foreground">{seq.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span className="font-mono w-5 text-right">{i + 1}.</span>
                    <Badge variant="outline" className="text-xs">
                      {channelLabel(step.channel)}
                    </Badge>
                    <span>
                      {step.delayDays > 0 ? `+${step.delayDays}d` : "Inmediato"}
                    </span>
                  </div>
                ))}
                {seq.steps.length > 4 && (
                  <p className="text-xs text-muted-foreground pl-7">
                    +{seq.steps.length - 4} pasos más
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(seq.id)}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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
