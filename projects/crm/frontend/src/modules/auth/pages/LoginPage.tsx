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
    if (!password) next.password = 'La contraseña es obligatoria';
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Ciudad Moto
            <span className="ml-2 inline-block rounded bg-blue-100 px-2 py-0.5 align-middle text-sm font-semibold text-blue-700">
              CRM
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Ingresá tus credenciales para continuar
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
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
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              className={cn(
                'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition-colors',
                'placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                errors.email
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300',
              )}
              placeholder="usuario@ciudadmoto.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Contraseña
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
                'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition-colors',
                'placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                errors.password
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300',
              )}
              placeholder="********"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors',
              'bg-blue-600 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Ingresando...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
