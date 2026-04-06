'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  date_start: string;
  date_end: string;
  status: 'draft' | 'live' | 'ended';
}

function toLocalDatetime(iso: string) {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function EventEdit() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('id, name, description, location, date_start, date_end, status')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setEvent(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const { error: updateError } = await supabase
        .from('events')
        .update({
          name: form.get('name') as string,
          description: (form.get('description') as string) || null,
          location: (form.get('location') as string) || null,
          date_start: new Date(form.get('date_start') as string).toISOString(),
          date_end: new Date(form.get('date_end') as string).toISOString(),
          status: form.get('status') as string,
        })
        .eq('id', id);

      if (updateError) throw updateError;
      router.push(`/events/detail?id=${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        <div className="h-4 bg-slate-800 rounded w-32" />
        <div className="h-8 bg-slate-800 rounded w-64" />
        <div className="h-64 bg-slate-900 rounded-xl" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-2xl space-y-4">
        <Link href="/events" className="text-sm text-slate-400 hover:text-white transition-colors">
          &larr; Back to Events
        </Link>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/events/detail?id=${event.id}`}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          &larr; Back to Event Detail
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>

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
            defaultValue={event.name}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
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
            defaultValue={event.description ?? ''}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
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
            defaultValue={event.location ?? ''}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
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
              defaultValue={toLocalDatetime(event.date_start)}
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
              defaultValue={toLocalDatetime(event.date_end)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1.5">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={event.status}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          >
            <option value="draft">Draft</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
          </select>
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/events/detail?id=${event.id}`}
            className="px-5 py-2.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
