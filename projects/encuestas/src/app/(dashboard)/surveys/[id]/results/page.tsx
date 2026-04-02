"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────

interface ScaleStats {
  average: number;
  distribution: Record<string, number>;
}

interface MultipleChoiceOption {
  id: string;
  text: string;
  count: number;
  percentage: number;
}

interface MultipleChoiceStats {
  options: MultipleChoiceOption[];
}

interface YesNoStats {
  yes: { count: number; percentage: number };
  no: { count: number; percentage: number };
}

interface TextStats {
  responses: string[];
}

interface QuestionResult {
  id: string;
  text: string;
  type: "SCALE" | "MULTIPLE_CHOICE" | "YES_NO" | "TEXT";
  stats: ScaleStats | MultipleChoiceStats | YesNoStats | TextStats;
}

interface ResponseAnswer {
  questionId: string;
  value: string;
}

interface ResponseRow {
  id: string;
  createdAt: string;
  answers: ResponseAnswer[];
}

interface ResultsData {
  survey: { id: string; title: string; description: string | null; createdAt: string };
  totalResponses: number;
  lastResponseAt: string | null;
  questions: QuestionResult[];
  responses: {
    data: ResponseRow[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// ─── Constants ────────────────────────────────────────────

const BAR_COLOR = "#2563EB";
const BAR_ACCENT = "#60A5FA";

// ─── Chart Components ─────────────────────────────────────

function ScaleChart({ stats }: { stats: ScaleStats }) {
  const data = Object.entries(stats.distribution)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([rating, count]) => ({ name: rating, count }));

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Promedio</span>
        <Badge variant="secondary" className="text-base font-semibold tabular-nums">
          {stats.average.toFixed(1)} / 5
        </Badge>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={24} />
          <Tooltip
            formatter={(value) => [`${value} respuesta${value !== 1 ? "s" : ""}`, "Cantidad"]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MultipleChoiceChart({ stats }: { stats: MultipleChoiceStats }) {
  const data = stats.options.map((o) => ({
    name: o.text.length > 28 ? o.text.slice(0, 26) + "..." : o.text,
    count: o.count,
    percentage: o.percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, _name, entry) => [
            `${value} (${(entry?.payload as Record<string, number>)?.percentage ?? 0}%)`,
            "Respuestas",
          ]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={BAR_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function YesNoChart({ stats }: { stats: YesNoStats }) {
  const data = [
    { name: "Si", count: stats.yes.count, percentage: stats.yes.percentage },
    { name: "No", count: stats.no.count, percentage: stats.no.percentage },
  ];

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={32} />
        <Tooltip
          formatter={(value, _name, entry) => [
            `${value} (${(entry?.payload as Record<string, number>)?.percentage ?? 0}%)`,
            "Respuestas",
          ]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          <Cell fill={BAR_COLOR} />
          <Cell fill={BAR_ACCENT} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function TextResponses({ stats }: { stats: TextStats }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? stats.responses : stats.responses.slice(0, 5);
  const hasMore = stats.responses.length > 5;

  return (
    <div className="space-y-2">
      {visible.length === 0 && (
        <p className="text-sm text-muted-foreground italic">Sin respuestas de texto.</p>
      )}
      <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {visible.map((r, i) => (
          <li
            key={i}
            className="rounded-md border bg-muted/40 px-3 py-2 text-sm leading-relaxed"
          >
            {r}
          </li>
        ))}
      </ul>
      {hasMore && (
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Ver menos" : `Ver todas (${stats.responses.length})`}
        </Button>
      )}
    </div>
  );
}

function QuestionCard({ question }: { question: QuestionResult }) {
  const typeLabel: Record<string, string> = {
    SCALE: "Escala",
    MULTIPLE_CHOICE: "Opcion multiple",
    YES_NO: "Si / No",
    TEXT: "Texto libre",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{question.text}</CardTitle>
          <Badge variant="outline" className="shrink-0 text-xs">
            {typeLabel[question.type] ?? question.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {question.type === "SCALE" && <ScaleChart stats={question.stats as ScaleStats} />}
        {question.type === "MULTIPLE_CHOICE" && (
          <MultipleChoiceChart stats={question.stats as MultipleChoiceStats} />
        )}
        {question.type === "YES_NO" && <YesNoChart stats={question.stats as YesNoStats} />}
        {question.type === "TEXT" && <TextResponses stats={question.stats as TextStats} />}
      </CardContent>
    </Card>
  );
}

// ─── Responses Table ──────────────────────────────────────

function ResponsesTable({
  questions,
  responses,
  page,
  total,
  pageSize,
  onPageChange,
}: {
  questions: QuestionResult[];
  responses: ResponseRow[];
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);

  const truncate = (s: string, max = 40) =>
    s.length > max ? s.slice(0, max - 1) + "\u2026" : s;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Respuestas individuales</CardTitle>
        <CardDescription>{total} respuesta{total !== 1 ? "s" : ""} en total</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-36">Fecha</TableHead>
                {questions.map((q) => (
                  <TableHead key={q.id} className="min-w-[120px]">
                    {truncate(q.text, 30)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((r, idx) => {
                const answerMap = new Map(r.answers.map((a) => [a.questionId, a.value]));
                const rowNumber = (page - 1) * pageSize + idx + 1;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {rowNumber}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(r.createdAt)}
                    </TableCell>
                    {questions.map((q) => {
                      const val = answerMap.get(q.id) ?? "-";
                      return (
                        <TableCell key={q.id} className="max-w-[200px] text-sm" title={val}>
                          {truncate(val)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="border-t px-4 py-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) onPageChange(page - 1);
                    }}
                    aria-disabled={page <= 1}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`e-${i}`}>
                        <span className="px-2 text-muted-foreground">...</span>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={item === page}
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(item as number);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) onPageChange(page + 1);
                    }}
                    aria-disabled={page >= totalPages}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────

export default function SurveyResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchResults = useCallback(
    async (p: number) => {
      try {
        setLoading(true);
        const res = await fetch(`/api/surveys/${id}/results?page=${p}&pageSize=10`);
        if (!res.ok) throw new Error("No se pudieron cargar los resultados");
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchResults(page);
  }, [page, fetchResults]);

  const handlePageChange = (p: number) => setPage(p);

  const handleExport = (format: "csv" | "xlsx") => {
    window.open(`/api/surveys/${id}/export?format=${format}`, "_blank");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ─── Loading ────────────────────────────────────────────

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchResults(page)}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  // ─── Empty State ────────────────────────────────────────

  if (data.totalResponses === 0) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="mb-6">
          <Link
            href="/surveys"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; Volver
          </Link>
          <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            {data.survey.title} &mdash; Resultados
          </h1>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground">
              Todavia no hay respuestas. Comparti el link de tu encuesta para empezar a recibir
              respuestas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Results ────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <Link
          href="/surveys"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Volver
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {data.survey.title} &mdash; Resultados
        </h1>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span>
              <span className="font-medium">{data.totalResponses}</span>{" "}
              <span className="text-muted-foreground">
                respuesta{data.totalResponses !== 1 ? "s" : ""}
              </span>
            </span>
            {data.lastResponseAt && (
              <span className="text-muted-foreground">
                Ultima: {formatDate(data.lastResponseAt)}
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              Exportar
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="ml-1"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeWidth={1.5} d="M4 6l4 4 4-4" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Descargar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                Descargar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Charts per question */}
      <div className="space-y-4">
        {data.questions.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>

      {/* Individual responses table */}
      <ResponsesTable
        questions={data.questions}
        responses={data.responses.data}
        page={data.responses.page}
        total={data.responses.total}
        pageSize={data.responses.pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
