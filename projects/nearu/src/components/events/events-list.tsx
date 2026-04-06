'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SkeletonEventCard } from '@/components/ui/skeleton';

interface Event {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  date_start: string;
  date_end: string;
  status: 'draft' | 'live' | 'ended';
  participant_count?: number;
  checked_in_count?: number;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  live: 'bg-teal-500/15 text-teal-300 border-teal-400/40',
  ended: 'bg-slate-700/30 text-slate-500 border-slate-700/60',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: Event['status'] }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusStyles[status]}`}
    >
      {status === 'live' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
        </span>
      )}
      {status}
    </span>
  );
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
            const { count: checkedIn } = await supabase
              .from('event_participants')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id)
              .eq('checked_in', true);
            return {
              ...event,
              participant_count: count ?? 0,
              checked_in_count: checkedIn ?? 0,
            };
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
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonEventCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor your events
          </p>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(20,184,166,0.7)] transition-all hover:-translate-y-0.5 hover:bg-teal-400 active:translate-y-0"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-16 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
            <svg
              className="h-8 w-8 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-200">No events yet</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Create your first event to start managing attendees and beacons.
          </p>
          <Link
            href="/events/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-400"
          >
            + Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, idx) => {
            const total = event.participant_count ?? 0;
            const checked = event.checked_in_count ?? 0;
            const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
            return (
              <Link
                key={event.id}
                href={`/events/detail?id=${event.id}`}
                className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:-translate-y-0.5 hover:border-teal-500/40 hover:bg-slate-900 hover:shadow-[0_20px_40px_-20px_rgba(20,184,166,0.3)] animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}
              >
                {/* Gradient accent */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="truncate pr-3 text-lg font-semibold transition-colors group-hover:text-teal-300">
                    {event.name}
                  </h3>
                  <StatusBadge status={event.status} />
                </div>
                {event.location && (
                  <p className="mb-1 flex items-center gap-1.5 truncate text-sm text-slate-400">
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M12 22s-8-7.5-8-13a8 8 0 0 1 16 0c0 5.5-8 13-8 13z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    {event.location}
                  </p>
                )}
                <p className="mb-4 text-sm text-slate-500">
                  {formatDate(event.date_start)} – {formatDate(event.date_end)}
                </p>

                {/* Progress bar */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-semibold tabular-nums text-slate-300">
                      {checked}/{total}{' '}
                      <span className="text-slate-500">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-300 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
