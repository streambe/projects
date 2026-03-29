import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { ClientForm } from './ClientForm';

// ---------------------------------------------------------------------------
// Mock the hooks directly — avoids needing to mock axios internals
// vi.mock is hoisted before variable declarations, so we use vi.hoisted()
// to ensure the mock functions are available in the factory.
// ---------------------------------------------------------------------------

const { mockCreateMutate, mockUpdateMutate } = vi.hoisted(() => ({
  mockCreateMutate: vi.fn(),
  mockUpdateMutate: vi.fn(),
}));

vi.mock('../hooks/useClients', () => ({
  useCreateClient: () => ({
    mutateAsync: mockCreateMutate,
    isPending: false,
  }),
  useUpdateClient: () => ({
    mutateAsync: mockUpdateMutate,
    isPending: false,
  }),
  clientQueryKeys: {
    all: ['clients'],
    list: (p: unknown) => ['clients', 'list', p],
    detail: (id: string) => ['clients', 'detail', id],
  },
}));

// Mock sonner toast to prevent side effects in tests
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Wrapper
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

function renderForm(props?: Partial<React.ComponentProps<typeof ClientForm>>) {
  const { wrapper: Wrapper } = makeWrapper();
  return render(
    createElement(Wrapper, null, createElement(ClientForm, props ?? {})),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ClientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Validation: nombre obligatorio
  // -------------------------------------------------------------------------

  it('muestra error de validación si se intenta guardar sin nombre', async () => {
    const user = userEvent.setup();
    renderForm();

    // Fill in required fields except firstName
    await user.type(screen.getByLabelText(/apellido/i), 'Perez');
    await user.type(screen.getByLabelText(/^dni/i), '12345678');
    await user.type(screen.getByLabelText(/teléfono principal/i), '1122334455');

    await user.click(screen.getByRole('button', { name: /crear cliente/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/el nombre es obligatorio/i);
    });

    // API should NOT have been called
    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Validation: DNI obligatorio
  // -------------------------------------------------------------------------

  it('muestra error de validación si se intenta guardar sin DNI', async () => {
    const user = userEvent.setup();
    renderForm();

    // Fill required fields except DNI
    await user.type(screen.getByLabelText(/^nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/apellido/i), 'Perez');
    await user.type(screen.getByLabelText(/teléfono principal/i), '1122334455');

    await user.click(screen.getByRole('button', { name: /crear cliente/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const dniError = alerts.find((el) => /el dni es obligatorio/i.test(el.textContent ?? ''));
      expect(dniError).toBeDefined();
    });

    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Submit button disabled while submitting
  // -------------------------------------------------------------------------

  it('el botón submit queda deshabilitado mientras se está enviando', async () => {
    const user = userEvent.setup();

    // Return a never-resolving promise to simulate perpetual pending state
    let resolvePost!: (value: unknown) => void;
    mockCreateMutate.mockReturnValue(
      new Promise((res) => {
        resolvePost = res;
      }),
    );

    renderForm();

    await user.type(screen.getByLabelText(/^nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/apellido/i), 'Perez');
    await user.type(screen.getByLabelText(/^dni/i), '12345678');
    await user.type(screen.getByLabelText(/teléfono principal/i), '1122334455');

    // Do NOT await — the click fires the submit but the async handler never resolves.
    // userEvent.click waits for all microtasks, so it would hang with a pending promise.
    void user.click(screen.getByRole('button', { name: /crear cliente/i }));

    // React-hook-form sets isSubmitting=true synchronously on form submit
    await waitFor(
      () => {
        expect(screen.getByTestId('submit-button')).toBeDisabled();
      },
      { timeout: 3000 },
    );

    // Resolve to flush pending state updates before test cleanup
    await act(async () => {
      resolvePost({ conflict: null, client: null });
    });
  });

  // -------------------------------------------------------------------------
  // Successful submission calls the mutation with correct data
  // -------------------------------------------------------------------------

  it('llama a la mutación con los datos correctos al guardar un cliente válido', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    mockCreateMutate.mockResolvedValue({
      client: {
        id: 'new-id',
        firstName: 'Juan',
        lastName: 'Perez',
        dni: '12345678',
        phonePrimary: '1122334455',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      conflict: null,
    });

    renderForm({ onSuccess });

    await user.type(screen.getByLabelText(/^nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/apellido/i), 'Perez');
    await user.type(screen.getByLabelText(/^dni/i), '12345678');
    await user.type(screen.getByLabelText(/teléfono principal/i), '1122334455');

    // Use userEvent.click with the mock set to immediately resolve
    await user.click(screen.getByRole('button', { name: /crear cliente/i }));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Juan',
        lastName: 'Perez',
        dni: '12345678',
        phonePrimary: '1122334455',
      }),
    );

    expect(onSuccess).toHaveBeenCalled();
  });
});
