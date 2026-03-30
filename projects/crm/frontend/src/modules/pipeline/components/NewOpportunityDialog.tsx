import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateOpportunity } from '../hooks/usePipeline';
import { useClientsList, useCreateClient } from '../../clients/hooks/useClients';
import { Button } from '../../../components/ui/Button';
import { IconPlus } from '../../../components/ui/Icons';
import { cn } from '../../../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NewOpportunityDialogProps {
  onClose: () => void;
}

type TabMode = 'existing' | 'new';

// ---------------------------------------------------------------------------
// Shared input styles
// ---------------------------------------------------------------------------

const inputClass = cn(
  'w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-gray-800',
  'placeholder:text-gray-400',
  'transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
);

const labelClass = 'block text-xs font-semibold text-gray-600 mb-1.5';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NewOpportunityDialog({ onClose }: NewOpportunityDialogProps) {
  // -- tab state
  const [mode, setMode] = useState<TabMode>('existing');

  // -- existing client mode
  const [selectedClientId, setSelectedClientId] = useState('');

  // -- new client mode
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [phonePrimary, setPhonePrimary] = useState('');

  // -- shared
  const [motoInterest, setMotoInterest] = useState('');

  // -- hooks
  const { data: clientsData, isLoading: clientsLoading } = useClientsList({ limit: 200 });
  const createClient = useCreateClient();
  const createOpportunity = useCreateOpportunity();

  const clients = clientsData?.data ?? [];
  const isSubmitting = createClient.isPending || createOpportunity.isPending;

  // -- close on overlay click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // -- close on Escape
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') onClose();
  }

  // -- submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      let clientId = selectedClientId;

      // If "new client" mode, create the client first
      if (mode === 'new') {
        if (!firstName.trim() || !lastName.trim() || !dni.trim() || !phonePrimary.trim()) {
          toast.error('Completa todos los campos del cliente.');
          return;
        }

        const result = await createClient.mutateAsync({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dni: dni.trim(),
          phonePrimary: phonePrimary.trim(),
        });

        if (result.conflict) {
          toast.error(
            `Ya existe un cliente con ese ${result.conflict.field === 'dni' ? 'DNI' : 'telefono'}: ${result.conflict.fullName}`,
          );
          return;
        }

        if (!result.client) {
          toast.error('No se pudo crear el cliente.');
          return;
        }

        clientId = result.client.id;
      }

      // Validate client selected
      if (!clientId) {
        toast.error('Selecciona un cliente.');
        return;
      }

      // Create the opportunity
      await createOpportunity.mutateAsync({
        clientId,
        motoInterest: motoInterest.trim() || undefined,
        stage: 'consulta',
      });

      toast.success('Oportunidad creada correctamente.');
      onClose();
    } catch {
      toast.error('Error al crear la oportunidad. Intenta de nuevo.');
    }
  }

  return (
    // -- overlay
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nueva oportunidad"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      {/* -- dialog card */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* header */}
        <div className="border-b border-surface-200 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Nueva oportunidad</h2>
        </div>

        {/* tab toggle */}
        <div className="flex border-b border-surface-200">
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-semibold transition-colors',
              mode === 'existing'
                ? 'border-b-2 border-brand-500 text-brand-600'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            Cliente existente
          </button>
          <button
            type="button"
            onClick={() => setMode('new')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-semibold transition-colors',
              mode === 'new'
                ? 'border-b-2 border-brand-500 text-brand-600'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            Nuevo cliente
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* -- existing client mode */}
          {mode === 'existing' && (
            <div>
              <label htmlFor="nod-client-select" className={labelClass}>
                Cliente
              </label>
              <select
                id="nod-client-select"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className={inputClass}
                disabled={clientsLoading}
              >
                <option value="">
                  {clientsLoading ? 'Cargando clientes...' : 'Seleccionar cliente'}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.lastName}, {c.firstName} - {c.dni}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* -- new client mode */}
          {mode === 'new' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="nod-firstName" className={labelClass}>
                    Nombre
                  </label>
                  <input
                    id="nod-firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="nod-lastName" className={labelClass}>
                    Apellido
                  </label>
                  <input
                    id="nod-lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Perez"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="nod-dni" className={labelClass}>
                    DNI
                  </label>
                  <input
                    id="nod-dni"
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="12345678"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="nod-phone" className={labelClass}>
                    Telefono
                  </label>
                  <input
                    id="nod-phone"
                    type="text"
                    value={phonePrimary}
                    onChange={(e) => setPhonePrimary(e.target.value)}
                    placeholder="3515551234"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* -- shared: moto interest */}
          <div>
            <label htmlFor="nod-motoInterest" className={labelClass}>
              Moto de interes
            </label>
            <input
              id="nod-motoInterest"
              type="text"
              value={motoInterest}
              onChange={(e) => setMotoInterest(e.target.value)}
              placeholder="Ej: Honda CB 250 Twister"
              className={inputClass}
            />
          </div>

          {/* -- actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={isSubmitting}
              icon={<IconPlus width={16} height={16} />}
            >
              Crear oportunidad
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
