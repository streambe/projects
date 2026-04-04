"use client";

import {
  useTodayActions,
  useCompleteStep,
  useSkipStep,
  usePauseEnrollment,
  type EnrollmentWithDetails,
} from "@/hooks/use-enrollments";
import { renderTemplate } from "@/lib/template-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, SkipForward, Pause, CalendarClock } from "lucide-react";
import { toast } from "sonner";

function channelLabel(ch: string) {
  switch (ch) {
    case "LINKEDIN": return "LinkedIn";
    case "EMAIL": return "Email";
    case "PHONE": return "Teléfono";
    default: return ch;
  }
}

function ActionCard({ enrollment }: { enrollment: EnrollmentWithDetails }) {
  const completeStep = useCompleteStep();
  const skipStep = useSkipStep();
  const pauseEnrollment = usePauseEnrollment();

  const step = enrollment.sequence.steps[enrollment.currentStep];
  if (!step) return null;

  const lead = enrollment.lead;
  const messageContent =
    step.template?.content || step.content || "";

  const rendered = renderTemplate(messageContent, {
    firstName: lead.firstName,
    lastName: lead.lastName,
    title: lead.title,
    company: lead.company,
  });

  const isPending =
    completeStep.isPending || skipStep.isPending || pauseEnrollment.isPending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              {lead.firstName} {lead.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {lead.title && `${lead.title} — `}
              {lead.company?.name || "Sin empresa"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{channelLabel(step.channel)}</Badge>
            <Badge variant="secondary">Score: {lead.score}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          Secuencia: <span className="font-medium">{enrollment.sequence.name}</span>
          {" "}
          (Paso {enrollment.currentStep + 1} de {enrollment.sequence.steps.length})
        </div>

        {step.subject && (
          <div className="text-sm">
            <span className="font-medium">Asunto:</span> {step.subject}
          </div>
        )}

        <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">
          {rendered || "Sin contenido de mensaje"}
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={() =>
              completeStep.mutate(enrollment.id, {
                onSuccess: () => toast.success("Paso completado"),
                onError: (e) => toast.error(e.message),
              })
            }
            disabled={isPending}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Completar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              skipStep.mutate(enrollment.id, {
                onSuccess: () => toast.success("Paso saltado"),
                onError: (e) => toast.error(e.message),
              })
            }
            disabled={isPending}
          >
            <SkipForward className="h-3.5 w-3.5 mr-1" />
            Saltar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              pauseEnrollment.mutate(enrollment.id, {
                onSuccess: () => toast.success("Enrollment pausado"),
                onError: (e) => toast.error(e.message),
              })
            }
            disabled={isPending}
          >
            <Pause className="h-3.5 w-3.5 mr-1" />
            Pausar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ActionsPage() {
  const { data: enrollments, isLoading } = useTodayActions();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Acciones del Día</h1>
        <p className="text-muted-foreground mt-1">
          Leads con acciones pendientes para hoy.
        </p>
      </div>

      {isLoading && <p className="text-muted-foreground">Cargando...</p>}

      {enrollments && enrollments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No hay acciones pendientes</p>
            <p className="text-muted-foreground mt-1">
              Todas las acciones del día están completadas.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {enrollments?.map((enrollment) => (
          <ActionCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </div>
    </div>
  );
}
