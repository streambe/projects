import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { Activity, UpdateActivityInput } from '../activities.types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const activityQueryKeys = {
  all: ['activities'] as const,
  list: (params?: Record<string, unknown>) => ['activities', 'list', params] as const,
  byClient: (clientId: string) => ['activities', 'client', clientId] as const,
};

// ---------------------------------------------------------------------------
// List activities (global — all clients)
// ---------------------------------------------------------------------------

export interface UseActivitiesListParams {
  status?: 'pendiente' | 'realizada';
  type?: 'llamada' | 'reunion' | 'tarea';
  dateFrom?: string;
  dateTo?: string;
  overdue?: boolean;
  clientId?: string;
  assignedTo?: string;
  limit?: number;
}

export interface ActivitiesListResponse {
  data: Activity[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export function useActivitiesList(params: UseActivitiesListParams = {}) {
  return useQuery({
    queryKey: activityQueryKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await api.get<ActivitiesListResponse>('/activities', {
        params: { ...params, limit: params.limit ?? 200 },
      });
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Activities by client
// ---------------------------------------------------------------------------

export function useClientActivities(clientId: string) {
  return useQuery({
    queryKey: activityQueryKeys.byClient(clientId),
    queryFn: async () => {
      const { data } = await api.get<ActivitiesListResponse>(`/clients/${clientId}/activities`);
      return data;
    },
    enabled: !!clientId,
  });
}

// ---------------------------------------------------------------------------
// Mark activity as done
// ---------------------------------------------------------------------------

export function useMarkActivityDone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const input: UpdateActivityInput = { status: 'realizada' };
      const { data } = await api.patch<{ data: Activity }>(`/activities/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
  });
}
