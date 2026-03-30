import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { IconUser, IconSettings } from '../../../components/ui/Icons';
import { cn } from '../../../lib/utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// ---------------------------------------------------------------------------
// Password form state
// ---------------------------------------------------------------------------

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_FORM: PasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

// ---------------------------------------------------------------------------
// Input component (local — avoids coupling to a shared primitive for now)
// ---------------------------------------------------------------------------

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  autoComplete?: string;
}

function Field({ id, label, value, onChange, type = 'text', error, autoComplete }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-red-400 focus:ring-red-500'
            : 'border-surface-200 focus:ring-brand-500',
        )}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfilePage
// ---------------------------------------------------------------------------

export function ProfilePage() {
  const { user } = useAuth();

  const [form, setForm] = useState<PasswordForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({});
  const [loading, setLoading] = useState(false);

  // -- helpers ----------------------------------------------------------------

  const set = (field: keyof PasswordForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // -- validation -------------------------------------------------------------

  function validate(): boolean {
    const next: Partial<Record<keyof PasswordForm, string>> = {};

    if (!form.currentPassword.trim()) {
      next.currentPassword = 'La contrasena actual es obligatoria';
    }
    if (!form.newPassword.trim()) {
      next.newPassword = 'La nueva contrasena es obligatoria';
    } else if (form.newPassword.length < 6) {
      next.newPassword = 'Minimo 6 caracteres';
    }
    if (!form.confirmPassword.trim()) {
      next.confirmPassword = 'Confirma tu nueva contrasena';
    } else if (form.confirmPassword !== form.newPassword) {
      next.confirmPassword = 'Las contrasenas no coinciden';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // -- submit -----------------------------------------------------------------

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Contrasena actualizada correctamente');
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo actualizar la contrasena';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  // -- derived ----------------------------------------------------------------

  const initials = user?.fullName ? getInitials(user.fullName) : '??';

  // -- render -----------------------------------------------------------------

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Mi perfil" subtitle="Configuracion de tu cuenta" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- Personal info card ---- */}
        <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-2 text-gray-500">
            <IconUser width={18} height={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Informacion personal
            </h2>
          </div>

          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-500 text-lg font-bold text-white select-none"
            >
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-gray-900">
                {user?.fullName ?? '--'}
              </p>
              <p className="truncate text-sm text-gray-500">
                {user?.email ?? '--'}
              </p>
            </div>
          </div>
        </section>

        {/* ---- Change password card ---- */}
        <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-2 text-gray-500">
            <IconSettings width={18} height={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Cambiar contrasena
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field
              id="currentPassword"
              label="Contrasena actual"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={set('currentPassword')}
              error={errors.currentPassword}
            />

            <Field
              id="newPassword"
              label="Nueva contrasena"
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={set('newPassword')}
              error={errors.newPassword}
            />

            <Field
              id="confirmPassword"
              label="Confirmar nueva contrasena"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              error={errors.confirmPassword}
            />

            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full sm:w-auto">
                Actualizar contrasena
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
