'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function EventCreate() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const description = (form.get('description') as string) || null;
    const location = (form.get('location') as string) || null;
    const date_start = form.get('date_start') as string;
    const date_end = form.get('date_end') as string;

    try {
      const { error: insertError } = await supabase.from('events').insert({
        name,
        description,
        location,
        date_start: new Date(date_start).toISOString(),
        date_end: new Date(date_end).toISOString(),
        uuid_namespace: crypto.randomUUID(),
        status: 'draft',
      });

      if (insertError) throw insertError;
      router.push('/events');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/events" className="text-sm text-slate-400 hover:text-white transition-colors">
          &larr; Back to Events
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Create Event</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
            Event Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="Tech Conference 2026"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
            placeholder="Brief description of the event..."
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-1.5">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="Convention Center, Buenos Aires"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date_start" className="block text-sm font-medium text-slate-300 mb-1.5">
              Start Date *
            </label>
            <input
              id="date_start"
              name="date_start"
              type="datetime-local"
              required
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="date_end" className="block text-sm font-medium text-slate-300 mb-1.5">
              End Date *
            </label>
            <input
              id="date_end"
              name="date_end"
              type="datetime-local"
              required
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Event Logo
          </label>
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
            <p className="text-sm text-slate-500">Logo upload coming soon</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Creating...' : 'Create Event'}
          </button>
          <Link
            href="/events"
            className="px-5 py-2.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
