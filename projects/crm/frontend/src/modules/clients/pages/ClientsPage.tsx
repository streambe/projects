import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClientsList } from '../hooks/useClients';

export function ClientsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useClientsList({ search: search || undefined, limit: 50 });
  const clients = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
      </div>

      <div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, DNI o teléfono..."
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <span className="text-sm">Cargando clientes...</span>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <span className="text-sm">No se encontraron clientes.</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">DNI</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ciudad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/clientes/${client.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {client.firstName} {client.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{client.dni}</td>
                  <td className="px-4 py-3 text-gray-600">{client.phonePrimary}</td>
                  <td className="px-4 py-3 text-gray-600">{client.city ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
