'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getParticipantByAccessCode } from '@/lib/api/participants';
import { setSession } from '@/lib/auth';
import { initPushNotifications } from '@/lib/push-setup';
import { startAutoSync } from '@/lib/sync-service';

// Keep a reference so layout can stop it on logout
let stopSync: (() => void) | null = null;

export function getStopSync() {
  return stopSync;
}

const CODE_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join('');

  function triggerError(msg: string) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  function updateDigit(index: number, raw: string) {
    const value = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!value) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // Support pasting full code into any box
    if (value.length > 1) {
      const chars = value.slice(0, CODE_LENGTH).split('');
      const next = Array(CODE_LENGTH).fill('');
      chars.forEach((c, i) => (next[i] = c));
      setDigits(next);
      const focusIdx = Math.min(chars.length, CODE_LENGTH - 1);
      inputsRef.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = value[0];
    setDigits(next);
    setError('');

    if (index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (code.length !== CODE_LENGTH) {
      triggerError('Please enter all 6 characters');
      return;
    }

    setLoading(true);
    try {
      const session = await getParticipantByAccessCode(code);
      if (!session) {
        triggerError('Invalid access code. Please check and try again.');
        setDigits(Array(CODE_LENGTH).fill(''));
        inputsRef.current[0]?.focus();
        return;
      }
      setSession(session);

      // Initialize push notifications and auto-sync after login
      initPushNotifications(session.participant.id).catch(console.error);
      stopSync = startAutoSync(30_000);

      router.push('/nearby');
    } catch {
      triggerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app-ambient px-4">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 shadow-[0_20px_40px_-12px_rgba(20,184,166,0.6)]">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <circle cx="12" cy="12" r="2.5" />
              <path d="M12 4a8 8 0 0 1 8 8" strokeLinecap="round" />
              <path d="M12 7.5a4.5 4.5 0 0 1 4.5 4.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            near<span className="text-teal-400">U</span>
          </h1>
          <p className="mt-2 text-center text-sm text-slate-400">
            Enter your access code to join the event
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`glass-card rounded-2xl p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ${
            shake ? 'animate-shake' : ''
          }`}
        >
          <label className="mb-3 block text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Access Code
          </label>

          <div className="mb-1 flex justify-center gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                inputMode="text"
                autoComplete="one-time-code"
                maxLength={1}
                value={d}
                onChange={(e) => updateDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.currentTarget.select()}
                aria-label={`Access code character ${i + 1}`}
                className={`h-14 w-11 rounded-xl border bg-slate-900/80 text-center font-mono text-2xl font-bold uppercase text-white caret-teal-400 transition-all focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
                    : d
                    ? 'border-teal-500/60 focus:border-teal-400 focus:ring-teal-500/30'
                    : 'border-slate-700 focus:border-teal-500 focus:ring-teal-500/30'
                }`}
              />
            ))}
          </div>

          <div className="min-h-[1.5rem] pt-2 text-center">
            {error && (
              <p className="text-xs font-medium text-red-400">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== CODE_LENGTH}
            className="mt-2 w-full rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-12px_rgba(20,184,166,0.7)] transition-all hover:bg-teal-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying...
              </span>
            ) : (
              'Join Event'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Your organizer will give you the access code at check-in.
        </p>
      </div>
    </div>
  );
}
