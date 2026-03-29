import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
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
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 1 — New clients report
// ---------------------------------------------------------------------------

function NewClientsReport() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState<{ total: number; rows: NewClientsReportRow[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    if (!from || !to) {
      toast.error('Seleccioná un rango de fechas para generar el reporte.');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.get<NewClientsReportResponse>('/reports/new-clients', {
        params: { from, to },
      });
      setResult(data.data);
    } catch {
      toast.error('No se pudo generar el reporte. Intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Clientes nuevos por período</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Cantidad de clientes registrados en el rango seleccionado.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <DateRangeSelector
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Generando...' : 'Generar reporte'}
        </button>
      </div>

      {result !== null && (
        <div className="space-y-4">
          {/* Total highlight */}
          <div className="inline-flex flex-col items-center rounded-2xl border border-blue-100 bg-blue-50 px-8 py-5">
            <span className="text-4xl font-black text-blue-700 tabular-nums">{result.total}</span>
            <span className="mt-1 text-sm font-medium text-blue-600">clientes nuevos</span>
          </div>

          {result.rows.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Fecha de alta
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Cómo nos conoció
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(parseISO(row.createdAt), "d 'de' MMMM yyyy", { locale: es })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.howFoundUs ? (HOW_FOUND_LABELS[row.howFoundUs] ?? row.howFoundUs) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-400 rounded-xl border border-gray-200 bg-white">
              <span className="text-sm">No se registraron clientes en ese período.</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 2 — Activities by user report
// ---------------------------------------------------------------------------

function ActivitiesByUserReport() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState<ActivitiesByUserRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  async function handleGenerate() {
    if (!from || !to) {
      toast.error('Seleccioná un rango de fechas para generar el reporte.');
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
      toast.error('No se pudo generar el reporte. Intentá nuevamente.');
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

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Actividades por vendedor</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Total y desglose de actividades por tipo para cada vendedor en el período.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <DateRangeSelector
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Generando...' : 'Generar reporte'}
        </button>
      </div>

      {rows !== null && (
        rows.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-400 rounded-xl border border-gray-200 bg-white">
            <span className="text-sm">No hay actividades en ese período.</span>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
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
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <>
                    <tr
                      key={row.userId}
                      className="cursor-pointer hover:bg-gray-50"
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
                          ▶
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.userName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                          {row.total}
                        </span>
                      </td>
                    </tr>
                    {expandedRows.has(row.userId) && (
                      <tr key={`${row.userId}-detail`} className="bg-gray-50">
                        <td />
                        <td colSpan={2} className="px-4 py-3">
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span className="flex items-center gap-1.5">
                              <span role="img" aria-label="Llamadas">📞</span>
                              <span className="text-gray-600">Llamadas:</span>
                              <span className="font-bold text-gray-900">{row.byType.llamada}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span role="img" aria-label="Reuniones">🤝</span>
                              <span className="text-gray-600">Reuniones:</span>
                              <span className="font-bold text-gray-900">{row.byType.reunion}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span role="img" aria-label="Tareas">✅</span>
                              <span className="text-gray-600">Tareas:</span>
                              <span className="font-bold text-gray-900">{row.byType.tarea}</span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generá reportes de clientes y actividades para analizar el rendimiento del equipo.
        </p>
      </div>

      <NewClientsReport />

      <hr className="border-gray-200" />

      <ActivitiesByUserReport />
    </div>
  );
}
