import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { api } from '../../../lib/api';
import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
  ClientsListResponse,
  CreateClientResponse,
  DuplicateConflict,
  DuplicateCheckResponse,
} from '../clients.types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const clientQueryKeys = {
  all: ['clients'] as const,
  list: (params?: Record<string, unknown>) => ['clients', 'list', params] as const,
  detail: (id: string) => ['clients', 'detail', id] as const,
};

// ---------------------------------------------------------------------------
// List clients
// ---------------------------------------------------------------------------

export interface UseClientsListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export function useClientsList(params: UseClientsListParams = {}) {
  return useQuery({
    queryKey: clientQueryKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await api.get<ClientsListResponse>('/clients', { params });
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Client detail
// ---------------------------------------------------------------------------

export function useClientDetail(id: string) {
  return useQuery({
    queryKey: clientQueryKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Client }>(`/clients/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Check duplicate — debounced, skips if value < 3 chars
// ---------------------------------------------------------------------------

export function useCheckDuplicate() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkDuplicate = useCallback(
    async (
      field: 'dni' | 'phonePrimary',
      value: string,
      excludeId?: string,
    ): Promise<DuplicateConflict | null> => {
      // Do NOT call the API if the value has fewer than 3 characters
      if (value.length < 3) {
        return null;
      }

      return new Promise((resolve, reject) => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(async () => {
          try {
            const params: Record<string, string> = { field, value };
            if (excludeId) params.excludeId = excludeId;

            const { data } = await api.get<DuplicateCheckResponse>(
              '/clients/check-duplicate',
              { params },
            );
            resolve(data.data.conflict);
          } catch (err) {
            reject(err);
          }
        }, 400);
      });
    },
    [],
  );

  return { checkDuplicate };
}

// ---------------------------------------------------------------------------
// Create client
// ---------------------------------------------------------------------------

export function useCreateClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClientInput) => {
      const { data } = await api.post<CreateClientResponse>('/clients', input);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate clients cache so the list refreshes
      void qc.invalidateQueries({ queryKey: clientQueryKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Update client
// ---------------------------------------------------------------------------

export function useUpdateClient(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateClientInput) => {
      const { data } = await api.patch<CreateClientResponse>(`/clients/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: clientQueryKeys.all });
      void qc.invalidateQueries({ queryKey: clientQueryKeys.detail(id) });
    },
  });
}

// ---------------------------------------------------------------------------
// Soft delete client
// ---------------------------------------------------------------------------

export function useDeleteClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/clients/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: clientQueryKeys.all });
    },
  });
}
