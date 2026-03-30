import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClientsList } from '../hooks/useClients';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { IconUsers, IconPlus, IconSearch } from '../../../components/ui/Icons';
import { ClientForm } from '../components/ClientForm';

export function ClientsPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useClientsList({ search: search || undefined, limit: 50 });
  const clients = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Clientes"
        subtitle={
          !isLoading && clients.length > 0
            ? `${clients.length} cliente${clients.length === 1 ? '' : 's'}`
            : undefined
        }
        actions={
          <Button
            variant="accent"
            icon={<IconPlus width={16} height={16} />}
            onClick={() => setShowForm(true)}
          >
            Nuevo cliente
          </Button>
        }
      />

      {/* Search */}
      <div className="relative w-full max-w-md">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <IconSearch width={16} height={16} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, DNI o telefono..."
          className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<IconUsers width={24} height={24} />}
          title="No se encontraron clientes"
          description={
            search
              ? `No hay resultados para "${search}". Intenta con otro termino.`
              : 'Todavia no hay clientes registrados en el sistema.'
          }
          action={
            !search
              ? { label: 'Crear primer cliente', onClick: () => setShowForm(true) }
              : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-surface-200 bg-surface-50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Nombre
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  DNI
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Telefono
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Ciudad
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="transition-colors hover:bg-surface-50"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/clientes/${client.id}`}
                      className="font-medium text-brand-500 transition-colors hover:text-brand-600"
                    >
                      {client.firstName} {client.lastName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{client.dni}</td>
                  <td className="px-5 py-3.5 text-gray-600">{client.phonePrimary}</td>
                  <td className="px-5 py-3.5 text-gray-600">{client.city ?? '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: New Client */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-surface-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Nuevo cliente</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-surface-100 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ClientForm onSuccess={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
