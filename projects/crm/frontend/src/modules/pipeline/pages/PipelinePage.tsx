import { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { IconPlus } from '../../../components/ui/Icons';
import { KanbanBoard } from '../components/KanbanBoard';
import { NewOpportunityDialog } from '../components/NewOpportunityDialog';

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
  const [showNewOpportunity, setShowNewOpportunity] = useState(false);

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-200 bg-white px-6 py-4">
        <PageHeader title="Pipeline de ventas" />

        <div className="flex items-center gap-3">
          {/* Vendedor filter */}
          <select
            value={filterVendedor}
            onChange={(e) => setFilterVendedor(e.target.value)}
            aria-label="Filtrar por vendedor"
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Todas las sucursales</option>
            {SUCURSALES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {/* New opportunity */}
          <Button
            variant="accent"
            icon={<IconPlus width={16} height={16} />}
            onClick={() => setShowNewOpportunity(true)}
          >
            Nueva oportunidad
          </Button>
        </div>
      </div>

      {/* Kanban board — takes all remaining vertical space */}
      <div className="flex-1 overflow-hidden px-6 pt-5">
        <KanbanBoard
          filterVendedor={filterVendedor || undefined}
          filterSucursal={filterSucursal || undefined}
        />
      </div>
      {/* New opportunity dialog */}
      {showNewOpportunity && (
        <NewOpportunityDialog onClose={() => setShowNewOpportunity(false)} />
      )}
    </div>
  );
}
