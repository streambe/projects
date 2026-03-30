import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../AuthContext';
import { cn } from '../../../lib/utils';
import type { AxiosError } from 'axios';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  function validate(): boolean {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'El email es obligatorio';
    if (!password) next.password = 'La contrasena es obligatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/clientes', { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const message =
        axiosErr.response?.data?.message ?? 'Credenciales incorrectas';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left branded panel */}
      <div
        className={cn(
          'hidden lg:flex lg:w-[480px] xl:w-[560px]',
          'flex-col justify-between',
          'bg-brand-800 p-10 text-white',
          'relative overflow-hidden',
        )}
      >
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-700/30" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-brand-700/20" />
        <div className="pointer-events-none absolute bottom-32 right-12 h-40 w-40 rounded-full bg-accent-400/5" />

        {/* Top: logo + tagline */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-400 shadow-lg shadow-accent-400/25">
              <span className="text-xl font-bold tracking-tight text-white">
                CM
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Ciudad Moto
              </h1>
              <span className="text-xs font-medium uppercase tracking-widest text-brand-300">
                Sistema CRM
              </span>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
              Gestiona tu concesionaria de forma inteligente
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-brand-300">
              Clientes, ventas, stock y seguimiento en una sola plataforma
              pensada para el mundo de las motos.
            </p>
          </div>
        </div>

        {/* Bottom: decorative accent bar */}
        <div className="relative z-10">
          <div className="h-1 w-16 rounded-full bg-accent-400" />
          <p className="mt-4 text-sm text-brand-400">
            Ciudad Moto &middot; CRM v1.0
          </p>
        </div>
      </div>

      {/* Right side: login form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-surface-50 px-6 py-12">
        {/* Mobile logo — visible only on smaller screens */}
        <div className="mb-10 flex flex-col items-center lg:hidden">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-400 shadow-lg shadow-accent-400/25">
            <span className="text-xl font-bold tracking-tight text-white">
              CM
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-brand-800">
            Ciudad Moto
          </h1>
          <span className="text-xs font-medium uppercase tracking-widest text-brand-500">
            Sistema CRM
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-brand-800">
              Iniciar sesion
            </h2>
            <p className="mt-2 text-sm text-surface-300">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-2xl border border-surface-200 bg-white p-7 shadow-card"
          >
            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-brand-700"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
                }}
                className={cn(
                  'block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm outline-none',
                  'transition-all duration-150',
                  'placeholder:text-surface-300',
                  'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-surface-200',
                )}
                placeholder="usuario@ciudadmoto.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-7">
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-brand-700"
              >
                Contrasena
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={cn(
                  'block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm outline-none',
                  'transition-all duration-150',
                  'placeholder:text-surface-300',
                  'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
                  errors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-surface-200',
                )}
                placeholder="********"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'flex w-full items-center justify-center rounded-lg px-4 py-2.5',
                'text-sm font-semibold text-white shadow-sm',
                'transition-all duration-150',
                'bg-brand-500 hover:bg-brand-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Ingresando...
                </>
              ) : (
                'Iniciar sesion'
              )}
            </button>
          </form>

          {/* Footer hint */}
          <p className="mt-6 text-center text-xs text-surface-300">
            Si no tenes cuenta, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
