"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Users,
  FileText,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLeads } from "@/hooks/use-leads";
import { useTemplates } from "@/hooks/use-templates";
import {
  useGenerateMessages,
  useMarkAsSent,
  type OutreachMessage,
} from "@/hooks/use-outreach";
import type { Lead, Template, Stage } from "@/types";

const STAGE_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  CONNECTED: "Conectado",
  ENGAGED: "Engaged",
  MQL: "MQL",
  SQL: "SQL",
  MEETING_SCHEDULED: "Reunion",
  PROPOSAL_SENT: "Propuesta",
  NEGOTIATION: "Negociacion",
  WON: "Ganado",
  LOST: "Perdido",
};

const STAGE_COLORS: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  CONNECTED: "bg-sky-100 text-sky-700",
  ENGAGED: "bg-violet-100 text-violet-700",
  MQL: "bg-amber-100 text-amber-700",
  SQL: "bg-emerald-100 text-emerald-700",
  MEETING_SCHEDULED: "bg-blue-100 text-blue-700",
  PROPOSAL_SENT: "bg-indigo-100 text-indigo-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
};

type Step = "select-leads" | "select-template" | "review";

export default function OutreachPage() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[#3957ED]" /></div>}>
      <OutreachPageInner />
    </Suspense>
  );
}

function OutreachPageInner() {
  const searchParams = useSearchParams();
  const preSelectedIds = searchParams.get("leadIds")?.split(",").filter(Boolean) || [];

  // Data
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const generateMutation = useGenerateMessages();
  const markSentMutation = useMarkAsSent();

  // Step state
  const [step, setStep] = useState<Step>("select-leads");

  // Step 1: Lead selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set(preSelectedIds));
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [linkedinOnly, setLinkedinOnly] = useState(false);

  // Step 2: Template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Step 3: Generated messages
  const [messages, setMessages] = useState<OutreachMessage[]>([]);
  const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pre-select leads from URL params
  useEffect(() => {
    if (preSelectedIds.length > 0 && leads && leads.length > 0) {
      setSelectedLeadIds(new Set(preSelectedIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter((lead) => {
      if (stageFilter !== "ALL" && lead.stage !== stageFilter) return false;
      if (linkedinOnly && !lead.linkedinUrl) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = `${lead.firstName} ${lead.lastName}`.toLowerCase();
        const company = (lead as any).company?.name?.toLowerCase() || "";
        const title = lead.title?.toLowerCase() || "";
        if (!name.includes(q) && !company.includes(q) && !title.includes(q)) return false;
      }
      return true;
    });
  }, [leads, stageFilter, linkedinOnly, searchQuery]);

  function toggleLead(id: string) {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedLeadIds(new Set(filteredLeads.map((l) => l.id)));
  }

  function deselectAll() {
    setSelectedLeadIds(new Set());
  }

  async function handleGenerate() {
    if (!selectedTemplateId || selectedLeadIds.size === 0) return;
    const result = await generateMutation.mutateAsync({
      leadIds: Array.from(selectedLeadIds),
      templateId: selectedTemplateId,
    });
    setMessages(result);
    setEditedMessages({});
    setSentIds(new Set());
    setStep("review");
  }

  function getMessage(leadId: string): string {
    return editedMessages[leadId] ?? messages.find((m) => m.leadId === leadId)?.message ?? "";
  }

  function updateMessage(leadId: string, text: string) {
    setEditedMessages((prev) => ({ ...prev, [leadId]: text }));
  }

  async function copyMessage(leadId: string) {
    const msg = getMessage(leadId);
    await navigator.clipboard.writeText(msg);
    setCopiedId(leadId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleMarkSent(leadId: string) {
    const msg = getMessage(leadId);
    await markSentMutation.mutateAsync({
      leadId,
      message: msg,
      activityType: "LINKEDIN_MESSAGE",
    });
    setSentIds((prev) => new Set([...prev, leadId]));
  }

  const sentCount = sentIds.size;
  const totalCount = messages.length;

  // LinkedIn templates only
  const linkedinTemplates = templates?.filter((t) => t.channel === "LINKEDIN") || [];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1
          className="text-lg font-bold tracking-tight text-[#141414]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Outreach
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Genera mensajes personalizados para tus leads y envialos por LinkedIn.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { key: "select-leads", label: "Seleccionar Leads", num: 1 },
          { key: "select-template", label: "Elegir Template", num: 2 },
          { key: "review", label: "Revisar y Enviar", num: 3 },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-3 w-3 text-[#CCCCCC]" />}
            <button
              onClick={() => {
                if (s.key === "select-leads") setStep("select-leads");
                else if (s.key === "select-template" && selectedLeadIds.size > 0)
                  setStep("select-template");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                step === s.key
                  ? "bg-[#3957ED] text-white"
                  : step === "review" && s.key !== "review"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#F5F7FF] text-[#666666]"
              }`}
            >
              <span className="font-bold">{s.num}</span>
              <span className="font-medium">{s.label}</span>
            </button>
          </div>
        ))}
      </div>

      {/* ──────── STEP 1: Select Leads ──────── */}
      {step === "select-leads" && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="rounded-[18px] border-[#E8EBFF]">
            <CardContent className="p-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#999999]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, empresa, cargo..."
                  className="w-full rounded-[12px] border border-[#E8EBFF] bg-white pl-9 pr-3 py-2 text-xs text-[#141414] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#3957ED] focus:ring-1 focus:ring-[#3957ED]/20"
                />
              </div>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="rounded-[10px] border border-[#E8EBFF] bg-white px-3 py-2 text-xs text-[#141414] focus:outline-none focus:border-[#3957ED]"
              >
                <option value="ALL">Todos los stages</option>
                {Object.entries(STAGE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setLinkedinOnly(!linkedinOnly)}
                className={`px-3 py-2 rounded-full text-[11px] font-medium border transition-all duration-200 ${
                  linkedinOnly
                    ? "bg-[#3957ED] text-white border-[#3957ED]"
                    : "bg-white text-[#666666] border-[#E8EBFF] hover:border-[#3957ED]/40"
                }`}
              >
                Solo con LinkedIn
              </button>
            </CardContent>
          </Card>

          {/* Select/deselect actions */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#666666]">
              {filteredLeads.length} leads encontrados
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-[11px] text-[#999999] h-7 px-2"
                onClick={selectAllFiltered}
              >
                Seleccionar todos
              </Button>
              {selectedLeadIds.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[11px] text-[#999999] h-7 px-2"
                  onClick={deselectAll}
                >
                  Deseleccionar
                </Button>
              )}
            </div>
          </div>

          {/* Loading */}
          {leadsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[#3957ED]" />
            </div>
          )}

          {/* Empty */}
          {!leadsLoading && filteredLeads.length === 0 && (
            <Card className="rounded-[18px] border-[#E8EBFF]">
              <CardContent className="p-8 text-center">
                <Users className="h-8 w-8 text-[#CCCCCC] mx-auto mb-2" />
                <p className="text-xs text-[#999999]">No se encontraron leads.</p>
              </CardContent>
            </Card>
          )}

          {/* Lead list */}
          <div className="grid gap-2">
            {filteredLeads.map((lead) => {
              const isSelected = selectedLeadIds.has(lead.id);
              const company = (lead as any).company;
              return (
                <Card
                  key={lead.id}
                  onClick={() => toggleLead(lead.id)}
                  className={`rounded-[14px] transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-[#3957ED] bg-[#F5F7FF]"
                      : "border-[#E8EBFF] hover:border-[#3957ED]/30"
                  }`}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    {/* Checkbox */}
                    <div
                      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "border-[#3957ED] bg-[#3957ED]"
                          : "border-[#D0D5DD]"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#141414] truncate">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {lead.title && (
                            <span className="flex items-center gap-1 text-[11px] text-[#666666] truncate">
                              <Briefcase className="h-3 w-3 text-[#999999] shrink-0" />
                              {lead.title}
                            </span>
                          )}
                          {company?.name && (
                            <span className="flex items-center gap-1 text-[11px] text-[#666666] truncate">
                              <Building2 className="h-3 w-3 text-[#999999] shrink-0" />
                              {company.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score + Stage */}
                      <div className="flex items-center gap-2 shrink-0">
                        {lead.score != null && lead.score > 0 && (
                          <span className="text-[11px] font-semibold text-[#3957ED]">
                            {lead.score}pts
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 ${STAGE_COLORS[lead.stage] || "bg-slate-100 text-slate-700"}`}
                        >
                          {STAGE_LABELS[lead.stage] || lead.stage}
                        </Badge>
                        {lead.linkedinUrl && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 bg-sky-50 text-sky-600 border-sky-200"
                          >
                            LI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sticky bottom bar */}
          {selectedLeadIds.size > 0 && (
            <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-[#E8EBFF] p-4 shadow-lg z-50">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <p className="text-xs text-[#666666]">
                  <strong className="text-[#141414]">{selectedLeadIds.size}</strong> lead
                  {selectedLeadIds.size > 1 ? "s" : ""} seleccionado
                  {selectedLeadIds.size > 1 ? "s" : ""}
                </p>
                <Button
                  className="rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs h-9 px-6 shadow-md hover:-translate-y-px transition-all duration-200"
                  onClick={() => setStep("select-template")}
                >
                  Elegir Template
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────── STEP 2: Select Template ──────── */}
      {step === "select-template" && (
        <div className="space-y-4">
          <button
            onClick={() => setStep("select-leads")}
            className="flex items-center gap-1 text-xs text-[#666666] hover:text-[#3957ED] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver a seleccionar leads
          </button>

          <p className="text-xs text-[#666666]">
            Selecciona una plantilla de LinkedIn para personalizar los mensajes.
            {linkedinTemplates.length === 0 && templates && templates.length > 0 && (
              <span className="text-amber-600 ml-1">
                No hay plantillas de LinkedIn. Mostrando todas las plantillas.
              </span>
            )}
          </p>

          {templatesLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[#3957ED]" />
            </div>
          )}

          {/* Empty */}
          {!templatesLoading && (!templates || templates.length === 0) && (
            <Card className="rounded-[18px] border border-dashed border-[#E8EBFF]">
              <CardContent className="py-12 text-center">
                <FileText className="h-8 w-8 text-[#CCCCCC] mx-auto mb-2" />
                <p className="text-xs text-[#999999]">
                  No hay plantillas. Crea una en la seccion Templates.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Template cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(linkedinTemplates.length > 0 ? linkedinTemplates : templates || []).map(
              (tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <Card
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`rounded-[18px] transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[#3957ED] bg-[#F5F7FF] shadow-md"
                        : "border-[#E8EBFF] hover:border-[#3957ED]/30 hover:shadow-sm"
                    }`}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#141414] truncate">
                          {tpl.name}
                        </p>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-[#3957ED] flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-[#666666] line-clamp-4 whitespace-pre-wrap leading-relaxed">
                        {tpl.content}
                      </p>
                      {/* Show variables */}
                      {tpl.variables && tpl.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {tpl.variables.map((v: string) => (
                            <span
                              key={v}
                              className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F5F7FF] text-[#3957ED] border border-[#E8EBFF]"
                            >
                              {`{{${v}}}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>

          {/* Generate button */}
          {selectedTemplateId && (
            <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-[#E8EBFF] p-4 shadow-lg z-50">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <p className="text-xs text-[#666666]">
                  <strong className="text-[#141414]">{selectedLeadIds.size}</strong> leads ·{" "}
                  1 template seleccionado
                </p>
                <Button
                  className="rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs h-9 px-6 shadow-md hover:-translate-y-px transition-all duration-200"
                  disabled={generateMutation.isPending}
                  onClick={handleGenerate}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Generar Mensajes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────── STEP 3: Review & Send ──────── */}
      {step === "review" && (
        <div className="space-y-4">
          <button
            onClick={() => setStep("select-template")}
            className="flex items-center gap-1 text-xs text-[#666666] hover:text-[#3957ED] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver a elegir template
          </button>

          {/* Counter bar */}
          <Card className="rounded-[18px] border-[#E8EBFF] bg-[#F5F7FF]">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                  <Send className="h-3.5 w-3.5 text-[#3957ED]" />
                  <strong className="text-[#141414]">
                    {sentCount} de {totalCount}
                  </strong>{" "}
                  enviados
                </div>
                {sentCount === totalCount && totalCount > 0 && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                    Todos enviados
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {generateMutation.isError && (
            <Card className="rounded-[18px] border-red-200 bg-red-50">
              <CardContent className="p-4 text-xs text-red-600">
                {(generateMutation.error as Error)?.message || "Error al generar mensajes"}
              </CardContent>
            </Card>
          )}

          {/* Message cards */}
          <div className="space-y-3">
            {messages.map((msg) => {
              const isSent = sentIds.has(msg.leadId);
              const isCopied = copiedId === msg.leadId;
              return (
                <Card
                  key={msg.leadId}
                  className={`rounded-[18px] transition-all duration-200 ${
                    isSent
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-[#E8EBFF]"
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Lead info header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-[#F5F7FF] flex items-center justify-center shrink-0">
                          <Users className="h-3.5 w-3.5 text-[#3957ED]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#141414] truncate">
                            {msg.leadName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#666666]">
                            {msg.title && <span>{msg.title}</span>}
                            {msg.title && msg.company && <span>·</span>}
                            {msg.company && <span>{msg.company}</span>}
                          </div>
                        </div>
                      </div>
                      {isSent && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Enviado
                        </Badge>
                      )}
                    </div>

                    {/* Message textarea */}
                    <Textarea
                      value={getMessage(msg.leadId)}
                      onChange={(e) => updateMessage(msg.leadId, e.target.value)}
                      className="text-xs min-h-[100px] resize-y rounded-[12px] border-[#E8EBFF] focus:border-[#3957ED] focus:ring-1 focus:ring-[#3957ED]/20"
                      disabled={isSent}
                    />

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-[11px] h-8 gap-1.5 border-[#E8EBFF] hover:border-[#3957ED]/40"
                        onClick={() => copyMessage(msg.leadId)}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copiar
                          </>
                        )}
                      </Button>

                      {msg.linkedinUrl && (
                        <a
                          href={msg.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-[11px] h-8 gap-1.5 border-[#E8EBFF] hover:border-[#3957ED]/40"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Abrir LinkedIn
                          </Button>
                        </a>
                      )}

                      {!isSent && (
                        <Button
                          size="sm"
                          className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] h-8 gap-1.5 ml-auto shadow-sm"
                          disabled={markSentMutation.isPending}
                          onClick={() => handleMarkSent(msg.leadId)}
                        >
                          <Check className="h-3 w-3" />
                          Marcar enviado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
