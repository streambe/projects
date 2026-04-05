"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  X,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Building2,
  Rocket,
  Monitor,
  MapPin,
  Briefcase,
  Check,
  Send,
  Copy,
  FileText,
  Sparkles,
  CheckCheck,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useStartLinkedInSearch,
  useSearchStatus,
  useSearchResults,
  useImportLinkedInProfiles,
} from "@/hooks/use-linkedin-search";
import { useTemplates } from "@/hooks/use-templates";
import {
  GEO_CODES,
  TITLE_PRESETS,
  QUICK_SEARCHES,
  type LinkedInEmployee,
} from "@/lib/linkedin-constants";

const ICON_MAP: Record<string, React.ReactNode> = {
  stethoscope: <Stethoscope className="h-5 w-5" />,
  building: <Building2 className="h-5 w-5" />,
  rocket: <Rocket className="h-5 w-5" />,
  monitor: <Monitor className="h-5 w-5" />,
};

const LIMIT_OPTIONS = [10, 25, 50];

type Phase = "search" | "templates" | "messages";

/** Client-side message from search profile data (no CRM dependency) */
interface ProfileMessage {
  linkedinUrl: string;
  fullName: string;
  firstName: string;
  company: string;
  jobTitle: string;
  location: string;
  message: string;
}

/** Render a template replacing variables with profile data */
function renderTemplateForProfile(
  content: string,
  profile: LinkedInEmployee,
  searchKeywords: string
): string {
  return content
    .replace(/\{\{nombre\}\}/g, profile.first_name || "")
    .replace(/\{\{apellido\}\}/g, profile.last_name || "")
    .replace(/\{\{empresa\}\}/g, profile.company || "")
    .replace(/\{\{cargo\}\}/g, profile.job_title || "")
    .replace(/\{\{industria\}\}/g, searchKeywords || "");
}

export default function LinkedInSearchPage() {
  // Phase state
  const [phase, setPhase] = useState<Phase>("search");

  // Filter state
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [selectedGeoCodes, setSelectedGeoCodes] = useState<number[]>([]);
  const [keywords, setKeywords] = useState("");
  const [limit, setLimit] = useState(25);

  // Search state
  const [requestId, setRequestId] = useState<string | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [pollStartTime, setPollStartTime] = useState<number | null>(null);
  const [pollTimedOut, setPollTimedOut] = useState(false);

  // Selection state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [existingUrls, setExistingUrls] = useState<Set<string>>(new Set());

  // Outreach state (client-side, no CRM)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [generatedMessages, setGeneratedMessages] = useState<ProfileMessage[]>([]);
  const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Optional CRM import
  const importMutation = useImportLinkedInProfiles();
  const [importDone, setImportDone] = useState(false);

  // Mutations & queries
  const startSearch = useStartLinkedInSearch();
  const statusQuery = useSearchStatus(searchDone ? null : requestId);
  const resultsQuery = useSearchResults(requestId, searchDone);
  const templatesQuery = useTemplates();

  // Filter templates to LinkedIn channel only
  const linkedinTemplates = (templatesQuery.data || []).filter(
    (t) => t.channel === "LINKEDIN"
  );

  // Track when status becomes "done"
  useEffect(() => {
    if (statusQuery.data?.status === "done") {
      setSearchDone(true);
    }
  }, [statusQuery.data?.status]);

  // Timeout polling after 60s
  useEffect(() => {
    if (!pollStartTime || searchDone) return;
    const interval = setInterval(() => {
      if (Date.now() - pollStartTime > 60000) {
        setPollTimedOut(true);
        setSearchDone(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [pollStartTime, searchDone]);

  // Check existing URLs in CRM when results load
  useEffect(() => {
    if (!resultsQuery.data?.data) return;
    const urls = resultsQuery.data.data.map((e) => e.linkedin_url);
    if (urls.length === 0) return;
    fetch("/api/linkedin/check-existing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.existing) setExistingUrls(new Set(data.existing));
      })
      .catch(() => {});
  }, [resultsQuery.data?.data]);

  const handleSearch = useCallback(
    (titles: string[], geos: number[], kw: string, lim: number) => {
      setRequestId(null);
      setSearchDone(false);
      setPollTimedOut(false);
      setSelected(new Set());
      setExistingUrls(new Set());
      setPhase("search");
      setSelectedTemplateId(null);
      setGeneratedMessages([]);
      setEditedMessages({});
      setImportDone(false);
      importMutation.reset();

      startSearch.mutate(
        {
          title_keywords: titles,
          geo_codes: geos,
          keywords: kw,
          limit: lim,
        },
        {
          onSuccess: (data) => {
            setRequestId(data.request_id);
            setPollStartTime(Date.now());
          },
        }
      );
    },
    [startSearch, importMutation]
  );

  function handleSearchClick() {
    if (selectedTitles.length === 0) return;
    handleSearch(selectedTitles, selectedGeoCodes, keywords, limit);
  }

  function handleQuickSearch(qs: (typeof QUICK_SEARCHES)[number]) {
    setSelectedTitles([...qs.title_keywords]);
    setSelectedGeoCodes([...qs.geo_codes]);
    setKeywords(qs.keywords);
    handleSearch([...qs.title_keywords], [...qs.geo_codes], qs.keywords, limit);
  }

  function toggleTitle(value: string) {
    setSelectedTitles((prev) =>
      prev.includes(value)
        ? prev.filter((t) => t !== value)
        : [...prev, value]
    );
  }

  function toggleGeo(code: number) {
    setSelectedGeoCodes((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  }

  function toggleSelect(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  function selectAll() {
    if (!resultsQuery.data?.data) return;
    const allUrls = resultsQuery.data.data
      .filter((e) => !existingUrls.has(e.linkedin_url))
      .map((e) => e.linkedin_url);
    setSelected(new Set(allUrls));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  /** Move to templates phase — no import needed */
  function handlePrepareMessages() {
    if (selected.size === 0) return;
    setPhase("templates");
  }

  /** Generate messages CLIENT-SIDE from selected profiles + template */
  function handleGenerateMessages() {
    if (!selectedTemplateId || !resultsQuery.data?.data) return;
    const template = linkedinTemplates.find((t) => t.id === selectedTemplateId);
    if (!template) return;

    const selectedProfiles = resultsQuery.data.data.filter((e) =>
      selected.has(e.linkedin_url)
    );

    const msgs: ProfileMessage[] = selectedProfiles.map((profile) => ({
      linkedinUrl: profile.linkedin_url,
      fullName: profile.full_name,
      firstName: profile.first_name,
      company: profile.company,
      jobTitle: profile.job_title,
      location: profile.location,
      message: renderTemplateForProfile(template.content, profile, keywords),
    }));

    setGeneratedMessages(msgs);
    const initial: Record<string, string> = {};
    msgs.forEach((m) => {
      initial[m.linkedinUrl] = m.message;
    });
    setEditedMessages(initial);
    setPhase("messages");
  }

  function handleCopy(url: string) {
    const msg = editedMessages[url];
    if (!msg) return;
    navigator.clipboard.writeText(msg);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  /** Optional: import selected profiles to CRM */
  function handleImportToCRM() {
    if (!resultsQuery.data?.data) return;
    const profiles = resultsQuery.data.data.filter((e) =>
      selected.has(e.linkedin_url)
    );
    importMutation.mutate(profiles, {
      onSuccess: () => {
        setImportDone(true);
      },
    });
  }

  function handleBackToSearch() {
    setPhase("search");
    setSelectedTemplateId(null);
    setGeneratedMessages([]);
    setEditedMessages({});
  }

  function handleBackToTemplates() {
    setPhase("templates");
    setGeneratedMessages([]);
    setEditedMessages({});
  }

  const results = resultsQuery.data?.data || [];
  const isSearching = startSearch.isPending || (requestId && !searchDone);
  const statusData = statusQuery.data;

  return (
    <div className="p-6 space-y-8 max-w-5xl pb-28">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-[#141414]" style={{ fontFamily: "Montserrat, sans-serif" }}>
          LinkedIn Lead Finder
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Busca perfiles en LinkedIn, genera mensajes personalizados y contactalos directamente.
        </p>
      </div>

      {/* Phase indicator */}
      {phase !== "search" && (
        <div className="flex items-center gap-2">
          <button
            onClick={phase === "templates" ? handleBackToSearch : handleBackToTemplates}
            className="flex items-center gap-1 text-xs text-[#3957ED] hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            {phase === "templates" ? "Volver a resultados" : "Volver a templates"}
          </button>
          <span className="text-[10px] text-[#999999]">/</span>
          <span className="text-[10px] text-[#999999]">
            {phase === "templates" ? "Elegir template" : "Mensajes generados"}
          </span>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* PHASE: SEARCH                                   */}
      {/* ════════════════════════════════════════════════ */}
      {phase === "search" && (
        <>
          {/* ──────── Section 1: Search Filters ──────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#3957ED]/10 flex items-center justify-center">
                <span className="text-xs font-bold text-[#3957ED]">1</span>
              </div>
              <h2 className="text-sm font-semibold text-[#141414]">Filtros de busqueda</h2>
            </div>

            <Card className="rounded-[18px] border-[#E8EBFF]">
              <CardContent className="p-5 space-y-4">
                {/* Title keywords */}
                <div>
                  <label className="text-[11px] font-medium text-[#666666] mb-2 block">
                    Cargos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TITLE_PRESETS.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => toggleTitle(t.value)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200 ${
                          selectedTitles.includes(t.value)
                            ? "bg-[#3957ED] text-white border-[#3957ED]"
                            : "bg-white text-[#666666] border-[#E8EBFF] hover:border-[#3957ED]/40"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Geo codes */}
                <div>
                  <label className="text-[11px] font-medium text-[#666666] mb-2 block">
                    Ubicacion
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GEO_CODES.map((g) => (
                      <button
                        key={g.code}
                        onClick={() => toggleGeo(g.code)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200 ${
                          selectedGeoCodes.includes(g.code)
                            ? "bg-[#3957ED] text-white border-[#3957ED]"
                            : "bg-white text-[#666666] border-[#E8EBFF] hover:border-[#3957ED]/40"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="text-[11px] font-medium text-[#666666] mb-2 block">
                    Keywords adicionales
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="salud, healthcare, hospital..."
                    className="w-full rounded-[12px] border border-[#E8EBFF] bg-white px-3 py-2 text-xs text-[#141414] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#3957ED] focus:ring-1 focus:ring-[#3957ED]/20"
                  />
                </div>

                {/* Limit + Search button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-medium text-[#666666]">Cantidad:</label>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="rounded-[10px] border border-[#E8EBFF] bg-white px-2 py-1.5 text-xs text-[#141414] focus:outline-none focus:border-[#3957ED]"
                    >
                      {LIMIT_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    className="rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs h-9 px-6 shadow-md hover:-translate-y-px transition-all duration-200"
                    disabled={selectedTitles.length === 0 || !!isSearching}
                    onClick={handleSearchClick}
                  >
                    {startSearch.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <Search className="h-3.5 w-3.5 mr-1.5" />
                        Buscar en LinkedIn
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick searches */}
            <div>
              <p className="text-[11px] font-medium text-[#999999] mb-2">Busquedas rapidas</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {QUICK_SEARCHES.map((qs) => (
                  <button
                    key={qs.label}
                    onClick={() => handleQuickSearch(qs)}
                    disabled={!!isSearching}
                    className="group text-left"
                  >
                    <Card className="rounded-[14px] border-[#E8EBFF] hover:border-[#3957ED]/40 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full">
                      <CardContent className="p-3 flex items-start gap-2.5">
                        <div className="h-8 w-8 rounded-[10px] bg-[#F5F7FF] flex items-center justify-center shrink-0 text-[#3957ED] group-hover:bg-[#3957ED] group-hover:text-white transition-colors duration-200">
                          {ICON_MAP[qs.icon] || <Search className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-[#141414] truncate">
                            {qs.label}
                          </p>
                          <p className="text-[10px] text-[#999999] mt-0.5 line-clamp-1">
                            {qs.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ──────── Section 2: Search Status ──────── */}
          {requestId && !searchDone && (
            <Card className="rounded-[18px] border-[#E8EBFF] bg-[#F5F7FF]">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-[#3957ED]" />
                  <div>
                    <p className="text-sm font-medium text-[#141414]">
                      Buscando en LinkedIn...
                    </p>
                    <p className="text-[11px] text-[#666666] mt-0.5">
                      {statusData
                        ? `${statusData.employees_scraped_so_far || 0} de ${statusData.total_count || "?"} perfiles encontrados`
                        : "Iniciando busqueda..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeout warning */}
          {pollTimedOut && results.length === 0 && (
            <Card className="rounded-[18px] border-amber-200 bg-amber-50">
              <CardContent className="p-4 flex items-center gap-2 text-xs text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                La busqueda excedio el tiempo maximo. Intenta con menos resultados o filtros mas especificos.
              </CardContent>
            </Card>
          )}

          {/* Search error */}
          {startSearch.isError && (
            <Card className="rounded-[18px] border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {(startSearch.error as Error)?.message || "Error al iniciar busqueda"}
              </CardContent>
            </Card>
          )}

          {/* ──────── Section 3: Results ──────── */}
          {searchDone && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-[#3957ED]/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#3957ED]">2</span>
                  </div>
                  <h2 className="text-sm font-semibold text-[#141414]">
                    Resultados ({results.length})
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] text-[#999999] h-7 px-2"
                    onClick={selectAll}
                  >
                    Seleccionar todos
                  </Button>
                  {selected.size > 0 && (
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

              <div className="grid gap-2">
                {results.map((employee) => {
                  const isExisting = existingUrls.has(employee.linkedin_url);
                  const isSelected = selected.has(employee.linkedin_url);

                  return (
                    <Card
                      key={employee.linkedin_url || employee.profile_id}
                      className={`rounded-[14px] transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#3957ED] bg-[#F5F7FF]"
                          : "border-[#E8EBFF] hover:border-[#3957ED]/30"
                      } ${isExisting ? "opacity-60" : ""}`}
                      onClick={() => !isExisting && toggleSelect(employee.linkedin_url)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        {/* Checkbox */}
                        <div
                          className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isExisting
                              ? "border-[#D0D5DD] bg-[#F5F5F5]"
                              : isSelected
                                ? "border-[#3957ED] bg-[#3957ED]"
                                : "border-[#D0D5DD]"
                          }`}
                        >
                          {(isSelected || isExisting) && (
                            <Check className={`h-3 w-3 ${isExisting ? "text-[#999999]" : "text-white"}`} />
                          )}
                        </div>

                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-[#F5F7FF] flex items-center justify-center shrink-0">
                          <Users className="h-4 w-4 text-[#3957ED]" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-[#141414] truncate">
                              {employee.full_name}
                            </p>
                            {isExisting && (
                              <Badge
                                variant="outline"
                                className="text-[9px] border-emerald-300 text-emerald-600 bg-emerald-50 px-1.5 py-0"
                              >
                                Ya en CRM
                              </Badge>
                            )}
                          </div>
                          {employee.job_title && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Briefcase className="h-3 w-3 text-[#999999]" />
                              <p className="text-[11px] text-[#666666] truncate">
                                {employee.job_title}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-0.5">
                            {employee.company && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-[#999999]" />
                                <p className="text-[11px] text-[#666666] truncate">
                                  {employee.company}
                                </p>
                              </div>
                            )}
                            {employee.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-[#999999]" />
                                <p className="text-[11px] text-[#999999] truncate">
                                  {employee.location}
                                </p>
                              </div>
                            )}
                          </div>
                          {employee.about && (
                            <p className="text-[10px] text-[#999999] mt-1 line-clamp-2">
                              {employee.about}
                            </p>
                          )}
                        </div>

                        {/* LinkedIn link */}
                        {employee.linkedin_url && (
                          <a
                            href={employee.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-[10px] text-[#3957ED] hover:underline shrink-0"
                          >
                            Ver
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* No results */}
          {searchDone && results.length === 0 && !pollTimedOut && !resultsQuery.isLoading && (
            <Card className="rounded-[18px] border-[#E8EBFF]">
              <CardContent className="p-8 text-center">
                <Users className="h-8 w-8 text-[#CCCCCC] mx-auto mb-2" />
                <p className="text-xs text-[#999999]">
                  No se encontraron perfiles. Intenta con otros filtros.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ──────── Sticky bottom action bar ──────── */}
          {selected.size > 0 && (
            <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-[#E8EBFF] p-4 shadow-lg z-50">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <p className="text-xs text-[#666666]">
                  <strong className="text-[#141414]">{selected.size}</strong> seleccionado
                  {selected.size > 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#999999] h-8"
                    onClick={deselectAll}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs h-9 px-6 shadow-md hover:-translate-y-px transition-all duration-200"
                    onClick={handlePrepareMessages}
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Preparar mensajes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* PHASE: TEMPLATES                                */}
      {/* ════════════════════════════════════════════════ */}
      {phase === "templates" && (
        <div className="space-y-4">
          {/* Selection summary */}
          <Card className="rounded-[18px] border-[#E8EBFF] bg-[#F5F7FF]">
            <CardContent className="p-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#3957ED]" />
              <p className="text-xs text-[#666666]">
                <strong className="text-[#141414]">{selected.size}</strong> perfiles seleccionados para enviar mensajes
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#3957ED]/10 flex items-center justify-center">
              <span className="text-xs font-bold text-[#3957ED]">3</span>
            </div>
            <h2 className="text-sm font-semibold text-[#141414]">Elegir template de mensaje</h2>
          </div>

          {templatesQuery.isLoading && (
            <div className="flex items-center gap-2 py-8 justify-center text-xs text-[#999999]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando templates...
            </div>
          )}

          {linkedinTemplates.length === 0 && !templatesQuery.isLoading && (
            <Card className="rounded-[18px] border-[#E8EBFF]">
              <CardContent className="p-8 text-center">
                <FileText className="h-8 w-8 text-[#CCCCCC] mx-auto mb-2" />
                <p className="text-xs text-[#999999]">
                  No hay templates de LinkedIn. Crea uno en la seccion de Templates.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {linkedinTemplates.map((template) => {
              const isActive = selectedTemplateId === template.id;
              return (
                <Card
                  key={template.id}
                  className={`rounded-[14px] cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "border-[#3957ED] bg-[#F5F7FF] shadow-md"
                      : "border-[#E8EBFF] hover:border-[#3957ED]/40 hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isActive
                            ? "border-[#3957ED] bg-[#3957ED]"
                            : "border-[#D0D5DD]"
                        }`}
                      >
                        {isActive && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#141414]">{template.name}</p>
                        <p className="text-[10px] text-[#999999] mt-1 line-clamp-3 whitespace-pre-line">
                          {template.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Generate button */}
          {linkedinTemplates.length > 0 && (
            <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-[#E8EBFF] p-4 shadow-lg z-50">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <p className="text-xs text-[#666666]">
                  {selectedTemplateId
                    ? `Template seleccionado para ${selected.size} perfiles`
                    : "Selecciona un template para continuar"}
                </p>
                <Button
                  className="rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs h-9 px-6 shadow-md hover:-translate-y-px transition-all duration-200"
                  disabled={!selectedTemplateId}
                  onClick={handleGenerateMessages}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Generar mensajes
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* PHASE: MESSAGES                                 */}
      {/* ════════════════════════════════════════════════ */}
      {phase === "messages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#3957ED]/10 flex items-center justify-center">
                <span className="text-xs font-bold text-[#3957ED]">4</span>
              </div>
              <h2 className="text-sm font-semibold text-[#141414]">
                Mensajes personalizados
              </h2>
            </div>
            <Badge variant="outline" className="text-[10px] border-[#E8EBFF] text-[#666666]">
              {generatedMessages.length} mensajes listos
            </Badge>
          </div>

          <div className="grid gap-3">
            {generatedMessages.map((msg) => {
              const isCopied = copiedUrl === msg.linkedinUrl;

              return (
                <Card
                  key={msg.linkedinUrl}
                  className="rounded-[14px] border-[#E8EBFF] transition-all duration-200"
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Profile header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#F5F7FF] flex items-center justify-center shrink-0">
                          <Users className="h-3.5 w-3.5 text-[#3957ED]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#141414]">{msg.fullName}</p>
                          <p className="text-[10px] text-[#999999]">
                            {msg.jobTitle}{msg.jobTitle && msg.company ? " · " : ""}{msg.company}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Editable message */}
                    <textarea
                      value={editedMessages[msg.linkedinUrl] || ""}
                      onChange={(e) =>
                        setEditedMessages((prev) => ({
                          ...prev,
                          [msg.linkedinUrl]: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full rounded-[12px] border border-[#E8EBFF] bg-white px-3 py-2.5 text-xs text-[#141414] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#3957ED] focus:ring-1 focus:ring-[#3957ED]/20 resize-none"
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-[11px] h-7 px-3 border-[#E8EBFF] text-[#666666] hover:border-[#3957ED]/40"
                        onClick={() => handleCopy(msg.linkedinUrl)}
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
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
                            className="rounded-full text-[11px] h-7 px-3 border-[#E8EBFF] text-[#3957ED] hover:border-[#3957ED]/40"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Abrir LinkedIn
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom bar with optional CRM import */}
          <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-[#E8EBFF] p-4 shadow-lg z-50">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <p className="text-xs text-[#666666]">
                <strong className="text-[#141414]">{generatedMessages.length}</strong> mensajes listos
              </p>
              <div className="flex gap-2">
                {!importDone ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs h-8 px-4 border-[#E8EBFF] text-[#666666] hover:border-[#3957ED]/40"
                    disabled={importMutation.isPending}
                    onClick={handleImportToCRM}
                  >
                    {importMutation.isPending ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1.5" />
                        Importar al CRM (opcional)
                      </>
                    )}
                  </Button>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] h-8 px-3 flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Importados al CRM
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs h-8 px-4 border-[#E8EBFF] text-[#666666]"
                  onClick={handleBackToSearch}
                >
                  <Search className="h-3 w-3 mr-1.5" />
                  Nueva busqueda
                </Button>
              </div>
            </div>
          </div>

          {/* Import error */}
          {importMutation.isError && (
            <Card className="rounded-[18px] border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="h-4 w-4" />
                {(importMutation.error as Error)?.message || "Error al importar al CRM"}
              </CardContent>
            </Card>
          )}

          {/* Import success toast */}
          {importMutation.isSuccess && importDone && (
            <Card className="rounded-[18px] border-emerald-200 bg-emerald-50">
              <CardContent className="p-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-xs text-emerald-700">
                  <strong>{importMutation.data.imported}</strong> leads importados al CRM
                  {importMutation.data.skipped > 0 && (
                    <span className="text-amber-600 ml-2">
                      ({importMutation.data.skipped} ya existian)
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
