"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  Building2,
  Clock,
  Send,
  MessageSquare,
  Activity as ActivityIcon,
  Target,
  TrendingUp,
  User,
  Pencil,
  Check,
  X,
  Tag,
  PhoneCall,
  CalendarCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLead, useUpdateLead, useActivities, useCreateActivity } from "@/hooks/use-leads";
import { Stage, ActivityType } from "@/types";
import { labelForScore, SCORE_COLORS, SCORE_TEXT_COLORS, type ScoreLabel } from "@/lib/scoring";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGE_OPTIONS: { key: Stage; label: string }[] = [
  { key: Stage.NEW, label: "Nuevo" },
  { key: Stage.CONNECTED, label: "Conectado" },
  { key: Stage.ENGAGED, label: "Interesado" },
  { key: Stage.MQL, label: "MQL" },
  { key: Stage.SQL, label: "SQL" },
  { key: Stage.MEETING_SCHEDULED, label: "Reunion Agendada" },
  { key: Stage.PROPOSAL_SENT, label: "Propuesta Enviada" },
  { key: Stage.NEGOTIATION, label: "Negociacion" },
  { key: Stage.WON, label: "Ganado" },
  { key: Stage.LOST, label: "Perdido" },
];

const ACTIVITY_TYPE_OPTIONS: { key: ActivityType; label: string; icon: React.ReactNode }[] = [
  { key: ActivityType.NOTE, label: "Nota", icon: <MessageSquare className="h-4 w-4" /> },
  { key: ActivityType.EMAIL_SENT, label: "Email enviado", icon: <Send className="h-4 w-4" /> },
  { key: ActivityType.EMAIL_RECEIVED, label: "Email recibido", icon: <Mail className="h-4 w-4" /> },
  { key: ActivityType.CALL, label: "Llamada", icon: <PhoneCall className="h-4 w-4" /> },
  { key: ActivityType.MEETING, label: "Reunion", icon: <CalendarCheck className="h-4 w-4" /> },
  { key: ActivityType.LINKEDIN_VIEW, label: "LinkedIn vista", icon: <ExternalLink className="h-4 w-4" /> },
  { key: ActivityType.LINKEDIN_CONNECT, label: "LinkedIn conexion", icon: <ExternalLink className="h-4 w-4" /> },
  { key: ActivityType.LINKEDIN_MESSAGE, label: "LinkedIn mensaje", icon: <ExternalLink className="h-4 w-4" /> },
];

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  NOTE: <MessageSquare className="h-3.5 w-3.5" />,
  EMAIL_SENT: <Send className="h-3.5 w-3.5" />,
  EMAIL_RECEIVED: <Mail className="h-3.5 w-3.5" />,
  CALL: <PhoneCall className="h-3.5 w-3.5" />,
  MEETING: <CalendarCheck className="h-3.5 w-3.5" />,
  LINKEDIN_VIEW: <ExternalLink className="h-3.5 w-3.5" />,
  LINKEDIN_CONNECT: <ExternalLink className="h-3.5 w-3.5" />,
  LINKEDIN_MESSAGE: <ExternalLink className="h-3.5 w-3.5" />,
  LINKEDIN_INMAIL: <ExternalLink className="h-3.5 w-3.5" />,
  STAGE_CHANGE: <TrendingUp className="h-3.5 w-3.5" />,
  SCORE_CHANGE: <Target className="h-3.5 w-3.5" />,
};

const ACTIVITY_LABELS: Record<string, string> = {
  NOTE: "Nota",
  EMAIL_SENT: "Email enviado",
  EMAIL_RECEIVED: "Email recibido",
  CALL: "Llamada",
  MEETING: "Reunion",
  LINKEDIN_VIEW: "Vista LinkedIn",
  LINKEDIN_CONNECT: "Conexion LinkedIn",
  LINKEDIN_MESSAGE: "Mensaje LinkedIn",
  LINKEDIN_INMAIL: "InMail LinkedIn",
  STAGE_CHANGE: "Cambio de etapa",
  SCORE_CHANGE: "Cambio de score",
};

function scoreColor(score: number) {
  if (score >= 70) return "bg-red-500/10 text-red-700 border-red-200";
  if (score >= 40) return "bg-orange-500/10 text-orange-700 border-orange-200";
  if (score >= 20) return "bg-amber-500/10 text-amber-700 border-amber-200";
  return "bg-[#F5F7FF] text-[#666666] border-[#E8EBFF]";
}

function scoreLabelEs(label: ScoreLabel): string {
  const map: Record<ScoreLabel, string> = {
    COLD: "Frio",
    WARM: "Tibio",
    MQL: "MQL",
    SQL: "SQL",
  };
  return map[label];
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: lead, isLoading } = useLead(id);
  const { data: activities = [] } = useActivities(id);
  const updateLead = useUpdateLead();
  const createActivity = useCreateActivity();

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    linkedinUrl: "",
    notes: "",
  });

  // Activity form
  const [activityType, setActivityType] = useState<ActivityType>(ActivityType.NOTE);
  const [activitySubject, setActivitySubject] = useState("");
  const [activityContent, setActivityContent] = useState("");

  const startEditing = () => {
    if (!lead) return;
    setEditForm({
      firstName: lead.firstName ?? "",
      lastName: lead.lastName ?? "",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      title: lead.title ?? "",
      linkedinUrl: lead.linkedinUrl ?? "",
      notes: lead.notes ?? "",
    });
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEdits = () => {
    if (!id) return;
    updateLead.mutate(
      { id, ...editForm } as any,
      { onSuccess: () => setEditing(false) }
    );
  };

  const handleStageChange = (newStage: string) => {
    if (!id) return;
    updateLead.mutate({ id, stage: newStage } as any);
  };

  const handleAddActivity = () => {
    if (!id || !activityContent.trim()) return;
    createActivity.mutate(
      {
        leadId: id,
        type: activityType,
        subject: activitySubject.trim() || undefined,
        content: activityContent.trim(),
      },
      {
        onSuccess: () => {
          setActivityContent("");
          setActivitySubject("");
          setActivityType(ActivityType.NOTE);
        },
      }
    );
  };

  // Loading / not found
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sm text-[#999999] animate-pulse">Cargando lead...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/pipeline")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver
        </Button>
        <p className="text-[#666666]">Lead no encontrado.</p>
      </div>
    );
  }

  const company = (lead as any).company;
  const scoreLabel = labelForScore(lead.score);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/pipeline")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Pipeline
        </Button>
      </div>

      {/* ================================================================ */}
      {/* HEADER CARD                                                      */}
      {/* ================================================================ */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Left: name + meta */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#141414]">
                  {lead.firstName} {lead.lastName}
                </h1>
                <Badge variant="outline" className={`text-sm font-bold px-2.5 py-1 ${scoreColor(lead.score)}`}>
                  {lead.score} &middot; {scoreLabelEs(scoreLabel)}
                </Badge>
                {lead.isTarget && (
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-xs">
                    <Target className="h-3 w-3 mr-1" /> Target
                  </Badge>
                )}
              </div>
              <p className="text-sm text-[#666666]">
                {lead.title && <span>{lead.title}</span>}
                {lead.title && company?.name && <span> en </span>}
                {company?.name && <span className="font-medium">{company.name}</span>}
              </p>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!editing ? (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={cancelEditing}>
                    <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={saveEdits} disabled={updateLead.isPending}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Guardar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stage selector */}
          <div className="flex gap-1.5 mt-4 flex-wrap">
            {STAGE_OPTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => handleStageChange(s.key)}
                className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                  lead.stage === s.key
                    ? "bg-[#3957ED] text-white border-[#3957ED]"
                    : "bg-white text-[#666666] border-[#E8EBFF] hover:border-blue-300 hover:text-[#3957ED]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* MAIN CONTENT: 2 columns on desktop                              */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COL (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit form */}
          {editing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Editar informacion</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#666666] mb-1 block">Nombre</label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#666666] mb-1 block">Apellido</label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#666666] mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#666666] mb-1 block">Telefono</label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#666666] mb-1 block">Cargo</label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#666666] mb-1 block">LinkedIn URL</label>
                  <Input
                    value={editForm.linkedinUrl}
                    onChange={(e) => setEditForm((p) => ({ ...p, linkedinUrl: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-[#666666] mb-1 block">Notas</label>
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agregar actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
                  <SelectTrigger className="sm:w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        <span className="flex items-center gap-2">
                          {opt.icon} {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Asunto (opcional)"
                  value={activitySubject}
                  onChange={(e) => setActivitySubject(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Textarea
                placeholder="Contenido de la actividad..."
                value={activityContent}
                onChange={(e) => setActivityContent(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleAddActivity}
                  disabled={!activityContent.trim() || createActivity.isPending}
                  className="bg-[#3957ED] hover:bg-[#2A43D4]"
                >
                  <Send className="h-3.5 w-3.5 mr-1" /> Registrar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linea de tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-[#999999] text-sm">
                  <ActivityIcon className="h-8 w-8 mb-2 opacity-40" />
                  Sin actividades todavia
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-[#E8EBFF]" />
                  <div className="space-y-4">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="flex gap-3 relative">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#E8EBFF] flex items-center justify-center shrink-0 z-10 text-[#666666]">
                          {ACTIVITY_ICONS[activity.type] ?? <ActivityIcon className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-xs font-medium text-[#141414]">
                              {ACTIVITY_LABELS[activity.type] ?? activity.type.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] text-[#999999]">
                              {format(new Date(activity.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                            </span>
                          </div>
                          {activity.subject && (
                            <p className="text-sm font-medium text-[#141414] mt-0.5">{activity.subject}</p>
                          )}
                          {activity.content && (
                            <p className="text-sm text-[#666666] mt-0.5">{activity.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COL (1/3) */}
        <div className="space-y-6">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacion de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-[#999999] shrink-0" />
                  <a href={`mailto:${lead.email}`} className="text-[#3957ED] hover:underline truncate">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-[#999999] shrink-0" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.linkedinUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-[#999999] shrink-0" />
                  <a
                    href={lead.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3957ED] hover:underline truncate"
                  >
                    Perfil de LinkedIn
                  </a>
                </div>
              )}
              {company?.name && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-[#999999] shrink-0" />
                  <span>{company.name}</span>
                  {company.industry && (
                    <span className="text-xs text-[#999999]">({company.industry})</span>
                  )}
                </div>
              )}
              {company?.size && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-[#999999] shrink-0" />
                  <span className="text-[#666666]">{company.size}</span>
                </div>
              )}

              <Separator />

              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <Clock className="h-4 w-4 text-[#999999] shrink-0" />
                <span>Creado el {format(new Date(lead.createdAt), "d MMM yyyy", { locale: es })}</span>
              </div>

              {lead.tags && (lead.tags as string[]).length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 text-[#999999] shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {(lead.tags as string[]).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {lead.notes && !editing && (
                <div className="text-sm text-[#666666] bg-[#F5F7FF] p-3 rounded-lg border border-[rgba(0,0,0,0.05)] mt-2">
                  {lead.notes}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Desglose de score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Total */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 text-3xl font-bold ${SCORE_TEXT_COLORS[scoreLabel]}`}>
                  {lead.score}
                  <span className="text-sm font-medium">{scoreLabelEs(scoreLabel)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#F5F7FF] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${SCORE_COLORS[scoreLabel]}`}
                    style={{ width: `${Math.min(100, lead.score)}%` }}
                  />
                </div>
              </div>

              <Separator />

              {/* Demographic */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#666666]">Demografico</span>
                  <span className="text-sm font-bold text-[#141414]">{lead.scoreDemographic ?? 0}/40</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F5F7FF] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(100, ((lead.scoreDemographic ?? 0) / 40) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#999999] mt-1">Cargo, industria, tamano empresa, pais</p>
              </div>

              {/* Behavioral */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#666666]">Comportamental</span>
                  <span className="text-sm font-bold text-[#141414]">{lead.scoreBehavioral ?? 0}/60</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F5F7FF] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all"
                    style={{ width: `${Math.min(100, ((lead.scoreBehavioral ?? 0) / 60) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#999999] mt-1">Emails, llamadas, reuniones, LinkedIn</p>
              </div>

              <Separator />

              {/* Thresholds legend */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-[#999999] uppercase tracking-wider">Umbrales</p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <span className="text-[#666666]">0-19: Frio</span>
                  <span className="text-amber-600">20-39: Tibio</span>
                  <span className="text-orange-600">40-69: MQL</span>
                  <span className="text-red-600">70+: SQL</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
