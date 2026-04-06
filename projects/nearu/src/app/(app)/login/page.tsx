'use client';

import { useState } from 'react';
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

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      setError('Access code must be 6 characters');
      return;
    }

    setLoading(true);
    try {
      const session = await getParticipantByAccessCode(trimmed);
      if (!session) {
        setError('Invalid access code. Please check and try again.');
        return;
      }
      setSession(session);

      // Initialize push notifications and auto-sync after login
      initPushNotifications(session.participant.id).catch(console.error);
      stopSync = startAutoSync(30_000);

      router.push('/nearby');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-teal-400">nearU</h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your access code to join the event
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          <label
            htmlFor="access-code"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Access Code
          </label>
          <input
            id="access-code"
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            autoComplete="off"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-center text-xl font-mono tracking-widest text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || code.trim().length !== 6}
            className="mt-4 w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Join Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
