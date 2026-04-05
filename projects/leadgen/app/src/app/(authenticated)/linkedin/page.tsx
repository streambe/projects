"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Sparkles,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLinkedInSearch,
  useImportLinkedInProfiles,
} from "@/hooks/use-linkedin-search";
import {
  GEO_CODES,
  TITLE_PRESETS,
  QUICK_SEARCHES,
  type LinkedInSearchResult,
} from "@/lib/linkedin-constants";

const NONE_VALUE = "__none__";

export default function LinkedInSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [geoCode, setGeoCode] = useState("");
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchGeoCode, setSearchGeoCode] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const {
    data: searchData,
    isLoading,
    isError,
    error,
  } = useLinkedInSearch({
    keyword: searchKeyword,
    geo_code: searchGeoCode,
    page,
  });

  const importMutation = useImportLinkedInProfiles();

  const results = searchData?.data ?? [];
  const totalCount = searchData?.total_result_count ?? 0;

  function handleSearch() {
    if (!keyword.trim()) return;
    setSearchKeyword(keyword.trim());
    setSearchGeoCode(geoCode);
    setPage(1);
    setSelected(new Set());
    setShowResults(true);
    importMutation.reset();
  }

  function handleQuickSearch(kw: string, geo: string) {
    setKeyword(kw);
    setGeoCode(geo);
    setSearchKeyword(kw);
    setSearchGeoCode(geo);
    setPage(1);
    setSelected(new Set());
    setShowResults(true);
    importMutation.reset();
  }

  function toggleSelect(profileUrl: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(profileUrl)) next.delete(profileUrl);
      else next.add(profileUrl);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((r) => r.profile_url)));
    }
  }

  const selectedProfiles = useMemo(
    () => results.filter((r) => selected.has(r.profile_url)),
    [results, selected]
  );

  function handleImport() {
    if (selectedProfiles.length === 0) return;
    importMutation.mutate(selectedProfiles);
  }

  const isApiMissing =
    isError && (error as Error)?.message?.includes("RAPIDAPI_KEY");

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-[#141414]">
          Buscar en LinkedIn
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Busca perfiles en LinkedIn e importalos como leads al CRM.
        </p>
      </div>

      {/* Quick searches */}
      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#999999] self-center mr-1">
          Busquedas rapidas
        </span>
        {QUICK_SEARCHES.map((qs) => (
          <button
            key={qs.label}
            onClick={() => handleQuickSearch(qs.keyword, qs.geo_code)}
            className="flex items-center gap-1.5 rounded-full border border-[#E8EBFF] bg-white px-3 py-1.5 text-[11px] font-medium text-[#3957ED] transition-all duration-200 hover:bg-[#F5F7FF] hover:border-[#3957ED]/40 hover:-translate-y-px"
          >
            <Sparkles className="h-3 w-3" />
            {qs.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <Card className="rounded-[18px] border-[#E8EBFF]">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Keyword */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-medium text-[#999999] uppercase tracking-wider mb-1 block">
                Palabra clave
              </label>
              <Input
                placeholder="CTO, CIO, Director de Tecnologia..."
                className="text-xs h-9"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Title preset */}
            <div className="w-56">
              <label className="text-[10px] font-medium text-[#999999] uppercase tracking-wider mb-1 block">
                Cargo tipo
              </label>
              <Select
                value={NONE_VALUE}
                onValueChange={(val) => {
                  if (val && val !== NONE_VALUE) setKeyword(val);
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Seleccionar cargo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE} className="text-xs">
                    Escribir manualmente
                  </SelectItem>
                  {TITLE_PRESETS.map((tp) => (
                    <SelectItem
                      key={tp.keyword}
                      value={tp.keyword}
                      className="text-xs"
                    >
                      {tp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="w-44">
              <label className="text-[10px] font-medium text-[#999999] uppercase tracking-wider mb-1 block">
                Ubicacion
              </label>
              <Select value={geoCode} onValueChange={(val) => setGeoCode(val ?? "")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs">
                    Todas las ubicaciones
                  </SelectItem>
                  {Object.entries(GEO_CODES).map(([label, code]) =>
                    code ? (
                      <SelectItem key={code} value={code} className="text-xs">
                        {label}
                      </SelectItem>
                    ) : null
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Search button */}
            <Button
              className="rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs h-9 px-5 shadow-md hover:-translate-y-px transition-all duration-200"
              disabled={!keyword.trim() || isLoading}
              onClick={handleSearch}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Search className="h-3.5 w-3.5 mr-1.5" />
              )}
              Buscar en LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API key missing message */}
      {isApiMissing && (
        <Card className="rounded-[18px] border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                API Key no configurada
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Para buscar en LinkedIn necesitas configurar la variable{" "}
                <code className="bg-amber-100 px-1 rounded text-[11px]">
                  RAPIDAPI_KEY
                </code>{" "}
                en tu archivo <code className="bg-amber-100 px-1 rounded text-[11px]">.env</code>.
                Podes obtener una key en{" "}
                <a
                  href="https://rapidapi.com/freshdata-freshdata-default/api/fresh-linkedin-profile-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  RapidAPI
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error (non-API-key) */}
      {isError && !isApiMissing && (
        <Card className="rounded-[18px] border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="h-4 w-4" />
            {(error as Error)?.message || "Error en la busqueda"}
          </CardContent>
        </Card>
      )}

      {/* Import success */}
      {importMutation.isSuccess && (
        <Card className="rounded-[18px] border-emerald-200 bg-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-800">
                Importacion completada
              </p>
              <button
                onClick={() => importMutation.reset()}
                className="ml-auto"
              >
                <X className="h-4 w-4 text-emerald-400 hover:text-emerald-600" />
              </button>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-emerald-700">
                <strong>{importMutation.data.imported}</strong> importados
              </span>
              {importMutation.data.skipped > 0 && (
                <span className="text-amber-600">
                  <strong>{importMutation.data.skipped}</strong> ya existian
                </span>
              )}
              {importMutation.data.errors.length > 0 && (
                <span className="text-red-600">
                  <strong>{importMutation.data.errors.length}</strong> errores
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import error */}
      {importMutation.isError && (
        <Card className="rounded-[18px] border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="h-4 w-4" />
            {(importMutation.error as Error)?.message || "Error al importar"}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {showResults && !isApiMissing && (
        <>
          {/* Results header */}
          {!isLoading && searchKeyword && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#666666]">
                {totalCount > 0 ? (
                  <>
                    <strong className="text-[#141414]">{totalCount}</strong>{" "}
                    resultados para &quot;{searchKeyword}&quot;
                  </>
                ) : (
                  <>Sin resultados para &quot;{searchKeyword}&quot;</>
                )}
              </p>
              {results.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="text-[11px] text-[#3957ED] hover:underline"
                >
                  {selected.size === results.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </button>
              )}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#3957ED]" />
              <span className="ml-2 text-sm text-[#666666]">
                Buscando en LinkedIn...
              </span>
            </div>
          )}

          {/* Result cards */}
          {!isLoading && results.length > 0 && (
            <div className="grid gap-3">
              {results.map((profile) => {
                const isSelected = selected.has(profile.profile_url);
                return (
                  <Card
                    key={profile.profile_url}
                    className={`rounded-[18px] transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[#3957ED] bg-[#F5F7FF]/50 shadow-sm"
                        : "border-[#E8EBFF] hover:border-[#3957ED]/30"
                    }`}
                    onClick={() => toggleSelect(profile.profile_url)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* Checkbox */}
                      <div
                        className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-[#3957ED] border-[#3957ED]"
                            : "border-[#D0D5DD]"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full bg-[#F5F7FF] flex items-center justify-center shrink-0 overflow-hidden">
                        {profile.profile_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profile.profile_image_url}
                            alt={profile.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="h-4 w-4 text-[#3957ED]" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#141414] truncate">
                          {profile.full_name}
                        </p>
                        <p className="text-[11px] text-[#666666] truncate">
                          {profile.headline}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {profile.current_company?.name && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-[#F5F7FF] text-[#3957ED] border-0"
                            >
                              {profile.current_company.name}
                            </Badge>
                          )}
                          {profile.location && (
                            <span className="text-[10px] text-[#999999]">
                              {profile.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View profile */}
                      <a
                        href={profile.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[11px] text-[#3957ED] hover:underline shrink-0"
                      >
                        Ver perfil
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && showResults && searchKeyword && results.length === 0 && !isError && (
            <div className="text-center py-16">
              <Users className="h-10 w-10 mx-auto text-[#999999] mb-3" />
              <p className="text-sm text-[#666666]">
                No se encontraron perfiles.
              </p>
              <p className="text-xs text-[#999999] mt-1">
                Proba con otros terminos de busqueda o ubicacion.
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalCount > 10 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs rounded-full"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-xs text-[#666666]">
                Pagina {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs rounded-full"
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      {/* Sticky import bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-[#E8EBFF] p-4 shadow-lg z-50">
          <div className="max-w-5xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#3957ED] text-white text-xs rounded-full px-3">
                {selected.size} seleccionados
              </Badge>
              <button
                onClick={() => setSelected(new Set())}
                className="text-[11px] text-[#999999] hover:text-[#666666]"
              >
                Limpiar seleccion
              </button>
            </div>
            <Button
              className="rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white text-xs px-6 shadow-md hover:-translate-y-px transition-all duration-200"
              disabled={importMutation.isPending}
              onClick={handleImport}
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Importando...
                </>
              ) : (
                <>Importar {selected.size} leads</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
