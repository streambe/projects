"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Link,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseCsv, type CsvParseResult } from "@/lib/csv-parser";
import {
  LEAD_FIELDS,
  type ColumnMapping,
  type ImportResult,
  parseLinkedInUrl,
} from "@/lib/import-utils";
import { useImportCsv, useImportLinkedIn } from "@/hooks/use-import";

type Step = "upload" | "mapping" | "result";

const NONE_VALUE = "__none__";

function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const patterns: Record<string, RegExp> = {
    firstName: /^(first\s*name|nombre|primer\s*nombre|given\s*name)$/i,
    lastName: /^(last\s*name|apellido|surname|family\s*name)$/i,
    email: /^(email|correo|e-?mail)$/i,
    phone: /^(phone|tel[eé]fono|mobile|cel(ular)?)$/i,
    title: /^(title|job\s*title|cargo|puesto|t[ií]tulo)$/i,
    linkedinUrl: /^(linkedin\s*(url|profile)?|perfil\s*linkedin|linkedin)$/i,
    company: /^(company|empresa|compa[ñn][ií]a|organization)$/i,
    industry: /^(industry|industria|sector|rubro)$/i,
  };

  for (const header of headers) {
    for (const [field, regex] of Object.entries(patterns)) {
      if (regex.test(header.trim())) {
        mapping[header] = field as ColumnMapping[string];
        break;
      }
    }
    if (!mapping[header]) {
      mapping[header] = "";
    }
  }
  return mapping;
}

export default function ImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<CsvParseResult | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const csvMutation = useImportCsv();
  const linkedinMutation = useImportLinkedIn();

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      const p = parseCsv(text);
      setParsed(p);
      setMapping(autoDetectMapping(p.headers));
      setStep("mapping");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleImportCsv = () => {
    csvMutation.mutate(
      { csvText, mapping },
      {
        onSuccess: (data) => {
          setResult(data);
          setStep("result");
        },
      }
    );
  };

  const handleImportLinkedIn = () => {
    const parsed = parseLinkedInUrl(linkedinUrl);
    if (!parsed) return;
    linkedinMutation.mutate(linkedinUrl);
  };

  const resetCsv = () => {
    setStep("upload");
    setCsvText("");
    setParsed(null);
    setMapping({});
    setFileName("");
    setResult(null);
    csvMutation.reset();
  };

  const previewRows = parsed ? parsed.rows.slice(0, 5) : [];
  const mappedFieldKeys = Object.values(mapping).filter(Boolean);
  const hasRequiredFields =
    mappedFieldKeys.includes("firstName") && mappedFieldKeys.includes("lastName");

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-[#141414]">
          Importar Leads
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Importa leads desde un archivo CSV o una URL de LinkedIn.
        </p>
      </div>

      <Tabs defaultValue="csv" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="csv" className="text-xs gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            CSV
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="text-xs gap-1.5">
            <Link className="h-3.5 w-3.5" />
            LinkedIn URL
          </TabsTrigger>
        </TabsList>

        {/* ── CSV Tab ── */}
        <TabsContent value="csv" className="space-y-4 mt-4">
          {step === "upload" && (
            <Card
              className={`rounded-[18px] border-dashed transition-all duration-200 cursor-pointer ${
                dragOver
                  ? "border-[#3957ED] bg-[#F5F7FF]"
                  : "border-[#E8EBFF] hover:border-[#3957ED]/40"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F7FF] mb-4">
                  <Upload className="h-6 w-6 text-[#3957ED]" />
                </div>
                <p className="text-sm font-semibold text-[#141414]">
                  Arrastra un archivo CSV o hace clic para seleccionar
                </p>
                <p className="text-xs text-[#999999] mt-1">
                  Archivos .csv con encabezados en la primera fila
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {step === "mapping" && parsed && (
            <>
              {/* File info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    {fileName}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {parsed.totalRows} filas
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-500"
                  onClick={resetCsv}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cambiar archivo
                </Button>
              </div>

              {/* Preview */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <p className="text-xs font-medium text-slate-500">
                    Vista previa (primeras {previewRows.length} filas)
                  </p>
                </CardHeader>
                <CardContent className="px-0 pb-2">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {parsed.headers.map((h) => (
                            <TableHead
                              key={h}
                              className="text-[10px] whitespace-nowrap"
                            >
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewRows.map((row, i) => (
                          <TableRow key={i}>
                            {parsed.headers.map((h) => (
                              <TableCell
                                key={h}
                                className="text-[11px] py-1.5 whitespace-nowrap max-w-[200px] truncate"
                              >
                                {row[h] || (
                                  <span className="text-slate-300">-</span>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Column mapping */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <p className="text-xs font-medium text-slate-500">
                    Mapeo de columnas
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Asigna cada columna del CSV al campo correspondiente del
                    lead. Nombre y Apellido son obligatorios.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-4">
                  {parsed.headers.map((header) => (
                    <div
                      key={header}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs text-slate-600 w-40 truncate shrink-0">
                        {header}
                      </span>
                      <span className="text-slate-300 text-xs">&rarr;</span>
                      <Select
                        value={mapping[header] || NONE_VALUE}
                        onValueChange={(val) =>
                          setMapping((prev) => ({
                            ...prev,
                            [header]: val === NONE_VALUE ? "" : val as ColumnMapping[string],
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs w-48">
                          <SelectValue placeholder="No mapear" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE} className="text-xs">
                            No mapear
                          </SelectItem>
                          {LEAD_FIELDS.map((f) => {
                            const usedBy = Object.entries(mapping).find(
                              ([col, val]) => val === f.key && col !== header
                            );
                            return (
                              <SelectItem
                                key={f.key}
                                value={f.key}
                                className="text-xs"
                                disabled={!!usedBy}
                              >
                                {f.label}
                                {f.required ? " *" : ""}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}

                  {!hasRequiredFields && (
                    <p className="text-[10px] text-amber-600 mt-2">
                      Debes mapear al menos First Name y Last Name para
                      continuar.
                    </p>
                  )}

                  <div className="pt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="text-xs rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white shadow-md hover:-translate-y-px transition-all duration-200"
                      disabled={!hasRequiredFields || csvMutation.isPending}
                      onClick={handleImportCsv}
                    >
                      {csvMutation.isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3 mr-1" />
                          Importar {parsed.totalRows} leads
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={resetCsv}
                    >
                      Cancelar
                    </Button>
                  </div>

                  {csvMutation.isError && (
                    <p className="text-xs text-red-600 mt-2">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {csvMutation.error?.message || "Error al importar"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {step === "result" && result && (
            <Card>
              <CardContent className="py-8 space-y-4">
                <div className="text-center">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
                  <p className="text-sm font-medium text-slate-900">
                    Importacion completada
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-lg font-semibold text-emerald-700">
                      {result.imported}
                    </p>
                    <p className="text-[10px] text-emerald-600">Importados</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-lg font-semibold text-amber-700">
                      {result.skipped}
                    </p>
                    <p className="text-[10px] text-amber-600">Omitidos</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-lg font-semibold text-red-700">
                      {result.errors.length}
                    </p>
                    <p className="text-[10px] text-red-600">Errores</p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-3 max-w-md mx-auto">
                    <p className="text-[10px] font-medium text-red-700 mb-1">
                      Detalle de errores:
                    </p>
                    <ul className="space-y-0.5">
                      {result.errors.slice(0, 10).map((err, i) => (
                        <li key={i} className="text-[10px] text-red-600">
                          {err}
                        </li>
                      ))}
                      {result.errors.length > 10 && (
                        <li className="text-[10px] text-red-400">
                          ...y {result.errors.length - 10} mas
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="text-center pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={resetCsv}
                  >
                    Importar otro archivo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── LinkedIn Tab ── */}
        <TabsContent value="linkedin" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <p className="text-xs font-medium text-slate-700">
                Importar desde LinkedIn
              </p>
              <p className="text-[10px] text-slate-400">
                Pega la URL de un perfil de LinkedIn para crear un lead
                automaticamente.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://linkedin.com/in/nombre-apellido"
                  className="text-xs h-8"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
                <Button
                  size="sm"
                  className="text-xs rounded-full bg-[#3957ED] hover:bg-[#2A43D4] text-white shadow-md shrink-0 hover:-translate-y-px transition-all duration-200"
                  disabled={
                    !linkedinUrl.includes("linkedin.com/in/") ||
                    linkedinMutation.isPending
                  }
                  onClick={handleImportLinkedIn}
                >
                  {linkedinMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Importar"
                  )}
                </Button>
              </div>

              {linkedinMutation.isSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded-md">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Lead importado exitosamente.
                </div>
              )}

              {linkedinMutation.isError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-md">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {linkedinMutation.error?.message || "Error al importar"}
                </div>
              )}

              {linkedinUrl && !linkedinUrl.includes("linkedin.com/in/") && linkedinUrl.length > 5 && (
                <p className="text-[10px] text-amber-600">
                  La URL debe ser un perfil de LinkedIn valido (ej:
                  https://linkedin.com/in/nombre)
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
