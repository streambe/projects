'use client';

import { useEffect, useState } from 'react';
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
  participant_count?: number;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  live: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  ended: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('id, name, description, location, date_start, date_end, status')
          .order('date_start', { ascending: false });

        if (fetchError) throw fetchError;

        const eventsWithCounts: Event[] = await Promise.all(
          (data || []).map(async (event) => {
            const { count } = await supabase
              .from('event_participants')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id);
            return { ...event, participant_count: count ?? 0 };
          })
        );

        setEvents(eventsWithCounts);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Events</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-slate-800 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-800 rounded w-1/2 mb-2" />
              <div className="h-4 bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400 mb-4">No events yet. Create your first one.</p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Create Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/detail?id=${event.id}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg group-hover:text-teal-400 transition-colors truncate pr-3">
                  {event.name}
                </h3>
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[event.status]}`}
                >
                  {event.status}
                </span>
              </div>
              {event.location && (
                <p className="text-sm text-slate-400 mb-1 truncate">
                  {event.location}
                </p>
              )}
              <p className="text-sm text-slate-500 mb-3">
                {formatDate(event.date_start)} - {formatDate(event.date_end)}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Participants: {event.participant_count}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
