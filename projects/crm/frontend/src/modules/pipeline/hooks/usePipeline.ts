import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type {
  Opportunity,
  CreateOpportunityInput,
  ChangeStageInput,
  OpportunitiesListResponse,
} from '../pipeline.types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const pipelineQueryKeys = {
  all: ['opportunities'] as const,
  list: (params?: Record<string, unknown>) => ['opportunities', 'list', params] as const,
  detail: (id: string) => ['opportunities', 'detail', id] as const,
};

// ---------------------------------------------------------------------------
// Kanban — fetch all open opportunities grouped for display
// Each opportunity includes lastActivityAt (RF-11) from the API
// ---------------------------------------------------------------------------

export interface UsePipelineParams {
  isOpen?: boolean;
}

export function usePipelineOpportunities(params: UsePipelineParams = {}) {
  return useQuery({
    queryKey: pipelineQueryKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await api.get<OpportunitiesListResponse>('/opportunities', {
        params: { ...params, limit: 200 },
      });
      // The API returns lastActivityAt on each opportunity (RF-11)
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Create opportunity
// ---------------------------------------------------------------------------

export function useCreateOpportunity() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOpportunityInput) => {
      const { data } = await api.post<{ data: Opportunity }>('/opportunities', input);
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: pipelineQueryKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Change stage
// ---------------------------------------------------------------------------

export function useChangeStage(opportunityId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: ChangeStageInput) => {
      const { data } = await api.put<{ data: Opportunity }>(
        `/opportunities/${opportunityId}/stage`,
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: pipelineQueryKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Delete opportunity
// ---------------------------------------------------------------------------

export function useDeleteOpportunity() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/opportunities/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: pipelineQueryKeys.all });
    },
  });
}
