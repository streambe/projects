import { useState } from 'react';
import { cn } from '../../../lib/utils';
import type { Opportunity, OpportunityResult } from '../pipeline.types';
import { OPPORTUNITY_RESULT } from '../pipeline.types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CloseOpportunityDialogProps {
  opportunity: Opportunity;
  onConfirm: (result: OpportunityResult, lostReason?: string) => void;
  onCancel: () => void;
  isPending?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CloseOpportunityDialog({
  opportunity,
  onConfirm,
  onCancel,
  isPending = false,
}: CloseOpportunityDialogProps) {
  const [result, setResult] = useState<OpportunityResult | null>(null);
  const [lostReason, setLostReason] = useState('');

  const clientName = `${opportunity.client.firstName} ${opportunity.client.lastName}`;
  const canSubmit = result !== null && (result === OPPORTUNITY_RESULT.ganado || lostReason.trim().length > 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!result || !canSubmit) return;
    onConfirm(
      result,
      result === OPPORTUNITY_RESULT.perdido ? lostReason.trim() : undefined,
    );
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
      role="presentation"
    >
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cerrar oportunidad"
        className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="text-lg font-bold text-gray-900">Cerrar oportunidad</h2>
        <p className="mt-1 text-sm text-gray-500">
          {clientName}
          {opportunity.motoInterest && ` — ${opportunity.motoInterest}`}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Result selector */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-700">Resultado</legend>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setResult(OPPORTUNITY_RESULT.ganado)}
                className={cn(
                  'flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors',
                  result === OPPORTUNITY_RESULT.ganado
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                )}
              >
                Ganado
              </button>
              <button
                type="button"
                onClick={() => setResult(OPPORTUNITY_RESULT.perdido)}
                className={cn(
                  'flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors',
                  result === OPPORTUNITY_RESULT.perdido
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                )}
              >
                Perdido
              </button>
            </div>
          </fieldset>

          {/* Lost reason — shown only when "perdido" is selected */}
          {result === OPPORTUNITY_RESULT.perdido && (
            <div>
              <label htmlFor="lost-reason" className="mb-1 block text-sm font-semibold text-gray-700">
                Motivo de la perdida
              </label>
              <textarea
                id="lost-reason"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                rows={3}
                placeholder="Precio, competencia, timing..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isPending}
              className={cn(
                'rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors',
                canSubmit && !isPending
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'cursor-not-allowed bg-gray-300',
              )}
            >
              {isPending ? 'Guardando...' : 'Confirmar cierre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
