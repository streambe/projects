import { useState } from 'react';
import { KanbanBoard } from '../components/KanbanBoard';

// ---------------------------------------------------------------------------
// Placeholder filter options — in production these come from the users/branches API
// ---------------------------------------------------------------------------

// TODO: Replace with real data from a useUsers() / useBranches() hook
const VENDEDORES: { id: string; label: string }[] = [];
const SUCURSALES: { id: string; label: string }[] = [];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PipelinePage() {
  const [filterVendedor, setFilterVendedor] = useState('');
  const [filterSucursal, setFilterSucursal] = useState('');

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Pipeline de ventas</h1>

        <div className="flex items-center gap-3">
          {/* Vendedor filter */}
          <select
            value={filterVendedor}
            onChange={(e) => setFilterVendedor(e.target.value)}
            aria-label="Filtrar por vendedor"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los vendedores</option>
            {VENDEDORES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>

          {/* Sucursal filter */}
          <select
            value={filterSucursal}
            onChange={(e) => setFilterSucursal(e.target.value)}
            aria-label="Filtrar por sucursal"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las sucursales</option>
            {SUCURSALES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban board — takes all remaining vertical space */}
      <div className="flex-1 overflow-hidden px-6 pt-5">
        <KanbanBoard
          filterVendedor={filterVendedor || undefined}
          filterSucursal={filterSucursal || undefined}
        />
      </div>
    </div>
  );
}
