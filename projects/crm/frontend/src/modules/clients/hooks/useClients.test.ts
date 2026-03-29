import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useCheckDuplicate, useCreateClient, clientQueryKeys } from './useClients';
import { api } from '../../../lib/api';

// ---------------------------------------------------------------------------
// Mock axios api instance
// ---------------------------------------------------------------------------

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Cast to any so vi.mocked mock methods are accessible on overloaded axios methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedApi = vi.mocked(api) as any;

// ---------------------------------------------------------------------------
// Test wrapper with a fresh QueryClient per test
// ---------------------------------------------------------------------------

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return { wrapper: Wrapper, queryClient };
}

// ---------------------------------------------------------------------------
// useCheckDuplicate
// ---------------------------------------------------------------------------

describe('useCheckDuplicate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no llama a la API si el valor tiene menos de 3 caracteres', async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCheckDuplicate(), { wrapper });

    let resolved: unknown;
    act(() => {
      result.current.checkDuplicate('dni', 'AB').then((v) => {
        resolved = v;
      });
    });

    // Advance timers past the debounce window (400ms)
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(mockedApi.get).not.toHaveBeenCalled();
    expect(resolved).toBeNull();
  });

  it('llama a la API si el valor tiene 3 o más caracteres', async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCheckDuplicate(), { wrapper });

    mockedApi.get.mockResolvedValueOnce({
      data: { data: { conflict: null } },
    });

    // Start the call (don't await — it debounces internally)
    let callPromise: Promise<unknown>;
    act(() => {
      callPromise = result.current.checkDuplicate('dni', '12345678');
    });

    // Advance fake timers past the 400ms debounce
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Drain the microtask queue so the axios mock resolves
    await act(async () => {
      await callPromise!;
    });

    expect(mockedApi.get).toHaveBeenCalledTimes(1);
  });

  it('retorna null para un valor vacío', async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCheckDuplicate(), { wrapper });

    let resolved: unknown;
    act(() => {
      result.current.checkDuplicate('dni', '').then((v) => {
        resolved = v;
      });
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(mockedApi.get).not.toHaveBeenCalled();
    expect(resolved).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// useCreateClient
// ---------------------------------------------------------------------------

describe('useCreateClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida el cache de clientes tras crear exitosamente', async () => {
    const { wrapper, queryClient } = makeWrapper();

    // Pre-seed a query so there's something to invalidate
    queryClient.setQueryData(clientQueryKeys.all, { data: [], meta: {} });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    mockedApi.post.mockResolvedValueOnce({
      data: {
        data: {
          client: {
            id: 'test-id',
            firstName: 'Juan',
            lastName: 'Perez',
            dni: '12345678',
            phonePrimary: '1122334455',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          conflict: null,
        },
      },
    });

    const { result } = renderHook(() => useCreateClient(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        firstName: 'Juan',
        lastName: 'Perez',
        dni: '12345678',
        phonePrimary: '1122334455',
      });
    });

    // invalidateQueries should have been called with the clients key
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: clientQueryKeys.all }),
    );
  });

  it('expone estado de error si la mutación falla', async () => {
    const { wrapper } = makeWrapper();

    mockedApi.post.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useCreateClient(), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          firstName: 'Juan',
          lastName: 'Perez',
          dni: '12345678',
          phonePrimary: '1122334455',
        });
      } catch {
        // expected — mutateAsync throws on rejection
      }
    });

    // TanStack Query v5 updates isError asynchronously via React state;
    // wait for the state to propagate.
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
