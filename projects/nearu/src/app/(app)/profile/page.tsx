'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, setSession } from '@/lib/auth';
import { updateParticipant } from '@/lib/api/participants';
import { NotificationSettings } from '@/components/app/notification-settings';
import { performLogout } from '@/app/(app)/layout';
import type { AuthSession } from '@/lib/types';

interface ProfileForm {
  full_name: string;
  company: string;
  role: string;
  photo_url: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    full_name: '',
    company: '',
    role: '',
    photo_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push('/login');
      return;
    }
    setSessionState(s);
    setForm({
      full_name: s.participant.full_name ?? '',
      company: s.participant.company ?? '',
      role: s.participant.role ?? '',
      photo_url: s.participant.photo_url ?? '',
    });
  }, [router]);

  function handleChange(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const updated = await updateParticipant(session.participant.id, {
        full_name: form.full_name || session.participant.full_name,
        company: form.company || null,
        role: form.role || null,
        photo_url: form.photo_url || null,
      });

      const newSession: AuthSession = {
        ...session,
        participant: updated,
      };
      setSession(newSession);
      setSessionState(newSession);
      setSaved(true);
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await performLogout(router);
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const fields: { key: keyof ProfileForm; label: string; type?: string; placeholder: string }[] = [
    { key: 'full_name', label: 'Full Name', placeholder: 'Jane Doe' },
    { key: 'company', label: 'Company', placeholder: 'Acme Inc.' },
    { key: 'role', label: 'Role', placeholder: 'Software Engineer' },
    { key: 'photo_url', label: 'Photo URL', type: 'url', placeholder: 'https://example.com/photo.jpg' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-24 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Profile</h1>

      <form onSubmit={handleSave} className="space-y-4">
        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              {label}
            </label>
            <input
              type={type ?? 'text'}
              value={form[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        ))}

        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && <p className="text-sm text-teal-400">Profile saved successfully.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {/* Notification Settings */}
      <div className="mt-8">
        <NotificationSettings />
      </div>

      {/* Logout */}
      <div className="mt-8 border-t border-slate-800 pt-6">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          {loggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>
    </div>
  );
}
