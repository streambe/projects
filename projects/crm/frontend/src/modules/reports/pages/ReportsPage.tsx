import { useState, Fragment } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { StatCard } from '../../../components/ui/StatCard';
import { IconUsers, IconChart, IconDownload } from '../../../components/ui/Icons';
import type {
  NewClientsReportResponse,
  NewClientsReportRow,
  ActivitiesByUserReportResponse,
  ActivitiesByUserRow,
} from '../reports.types';

// ---------------------------------------------------------------------------
// HOW_FOUND_US labels
// ---------------------------------------------------------------------------

const HOW_FOUND_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
  referido: 'Referido',
  visita_directa: 'Visita directa',
  otro: 'Otro',
};

// ---------------------------------------------------------------------------
// Activity type dot colors
// ---------------------------------------------------------------------------

const ACTIVITY_DOT: Record<string, string> = {
  llamada: 'bg-blue-500',
  reunion: 'bg-violet-500',
  tarea: 'bg-emerald-500',
};

// ---------------------------------------------------------------------------
// CSV download utility
// ---------------------------------------------------------------------------

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const escapeField = (field: string): string => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const headerLine = headers.map(escapeField).join(',');
  const dataLines = rows.map((row) => row.map(escapeField).join(','));
  const csvContent = [headerLine, ...dataLines].join('\r\n');

  // BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Date range selector (shared)
// ---------------------------------------------------------------------------

interface DateRangeSelectorProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

function DateRangeSelector({ from, to, onFromChange, onToChange }: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 1 -- New clients report
// ---------------------------------------------------------------------------

function NewClientsReport() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState<{ total: number; rows: NewClientsReportRow[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    if (!from || !to) {
      toast.error('Selecciona un rango de fechas para generar el reporte.');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.get<NewClientsReportResponse>('/reports/new-clients', {
        params: { from, to },
      });
      setResult(data.data);
    } catch {
      toast.error('No se pudo generar el reporte. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDownloadCSV() {
    if (!result || result.rows.length === 0) return;

    const headers = ['Nombre', 'Apellido', 'Fecha de alta', 'Como nos conocio'];
    const csvRows = result.rows.map((row) => [
      row.firstName,
      row.lastName,
      format(parseISO(row.createdAt), "d 'de' MMMM yyyy", { locale: es }),
      row.howFoundUs ? (HOW_FOUND_LABELS[row.howFoundUs] ?? row.howFoundUs) : '--',
    ]);

    downloadCSV(`clientes-nuevos-${from}-${to}.csv`, headers, csvRows);
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Clientes nuevos por periodo</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Cantidad de clientes registrados en el rango seleccionado.
        </p>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card space-y-4">
        <DateRangeSelector
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={() => void handleGenerate()}
            loading={isLoading}
          >
            {isLoading ? 'Generando...' : 'Generar reporte'}
          </Button>
          {result !== null && result.rows.length > 0 && (
            <Button
              variant="secondary"
              icon={<IconDownload />}
              onClick={handleDownloadCSV}
            >
              Descargar CSV
            </Button>
          )}
        </div>
      </div>

      {result !== null && (
        <div className="space-y-4">
          {/* Total highlight */}
          <StatCard
            label="Clientes nuevos"
            value={result.total}
            icon={<IconUsers />}
          />

          {result.rows.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
              <table className="w-full text-sm">
                <thead className="border-b border-surface-200 bg-surface-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Fecha de alta
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Como nos conocio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {result.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(parseISO(row.createdAt), "d 'de' MMMM yyyy", { locale: es })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.howFoundUs ? (HOW_FOUND_LABELS[row.howFoundUs] ?? row.howFoundUs) : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-400 rounded-2xl border border-surface-200 bg-white shadow-card">
              <span className="text-sm">No se registraron clientes en ese periodo.</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 2 -- Activities by user report
// ---------------------------------------------------------------------------

function ActivitiesByUserReport() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState<ActivitiesByUserRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  async function handleGenerate() {
    if (!from || !to) {
      toast.error('Selecciona un rango de fechas para generar el reporte.');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.get<ActivitiesByUserReportResponse>('/reports/activities-by-user', {
        params: { from, to },
      });
      setRows(data.data.rows);
      setExpandedRows(new Set());
    } catch {
      toast.error('No se pudo generar el reporte. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }

  function toggleRow(userId: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  function handleDownloadCSV() {
    if (!rows || rows.length === 0) return;

    const headers = ['Vendedor', 'Total', 'Llamadas', 'Reuniones', 'Tareas'];
    const csvRows = rows.map((row) => [
      row.userName,
      String(row.total),
      String(row.byType.llamada),
      String(row.byType.reunion),
      String(row.byType.tarea),
    ]);

    downloadCSV(`actividades-por-vendedor-${from}-${to}.csv`, headers, csvRows);
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Actividades por vendedor</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Total y desglose de actividades por tipo para cada vendedor en el periodo.
        </p>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card space-y-4">
        <DateRangeSelector
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            icon={<IconChart />}
            onClick={() => void handleGenerate()}
            loading={isLoading}
          >
            {isLoading ? 'Generando...' : 'Generar reporte'}
          </Button>
          {rows !== null && rows.length > 0 && (
            <Button
              variant="secondary"
              icon={<IconDownload />}
              onClick={handleDownloadCSV}
            >
              Descargar CSV
            </Button>
          )}
        </div>
      </div>

      {rows !== null && (
        rows.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-400 rounded-2xl border border-surface-200 bg-white shadow-card">
            <span className="text-sm">No hay actividades en ese periodo.</span>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="border-b border-surface-200 bg-surface-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 w-8" />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Vendedor
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {rows.map((row) => (
                  <Fragment key={row.userId}>
                    <tr
                      className="cursor-pointer hover:bg-surface-50 transition-colors"
                      onClick={() => toggleRow(row.userId)}
                    >
                      <td className="px-4 py-3 text-gray-400">
                        <span
                          className="inline-block transition-transform text-xs"
                          style={{
                            transform: expandedRows.has(row.userId) ? 'rotate(90deg)' : 'rotate(0deg)',
                          }}
                          aria-hidden="true"
                        >
                          &#9654;
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.userName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center justify-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                          {row.total}
                        </span>
                      </td>
                    </tr>
                    {expandedRows.has(row.userId) && (
                      <tr className="bg-surface-50">
                        <td />
                        <td colSpan={2} className="px-4 py-3">
                          <div className="flex flex-wrap gap-5 text-xs">
                            <span className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${ACTIVITY_DOT.llamada}`} />
                              <span className="text-gray-600">Llamadas:</span>
                              <span className="font-bold text-gray-900">{row.byType.llamada}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${ACTIVITY_DOT.reunion}`} />
                              <span className="text-gray-600">Reuniones:</span>
                              <span className="font-bold text-gray-900">{row.byType.reunion}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${ACTIVITY_DOT.tarea}`} />
                              <span className="text-gray-600">Tareas:</span>
                              <span className="font-bold text-gray-900">{row.byType.tarea}</span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ReportsPage() {
  return (
    <div className="space-y-10 p-6">
      <PageHeader
        title="Reportes"
        subtitle="Genera reportes de clientes y actividades para analizar el rendimiento del equipo."
      />

      <NewClientsReport />

      <hr className="border-surface-200" />

      <ActivitiesByUserReport />
    </div>
  );
}
