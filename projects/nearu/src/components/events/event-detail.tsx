'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ParticipantsList from '@/components/events/participants-list';
import BeaconsList from '@/components/events/beacons-list';

interface Event {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  date_start: string;
  date_end: string;
  status: 'draft' | 'live' | 'ended';
  uuid_namespace: string;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  live: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  ended: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const tabs = ['Info', 'Participants', 'Beacons', 'Analytics'] as const;
type Tab = (typeof tabs)[number];

export default function EventDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const [event, setEvent] = useState<Event | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Info');

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setEvent(data);

        const { count } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', id);
        setParticipantCount(count ?? 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-48" />
        <div className="h-8 bg-slate-800 rounded w-96" />
        <div className="h-64 bg-slate-900 rounded-xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link href="/events" className="text-sm text-slate-400 hover:text-white transition-colors">
          &larr; Back to Events
        </Link>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
          {error || 'Event not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/events" className="text-sm text-slate-400 hover:text-white transition-colors">
        &larr; Back to Events
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[event.status]}`}
            >
              {event.status}
            </span>
          </div>
          {event.location && <p className="text-slate-400">{event.location}</p>}
        </div>
        <Link
          href={`/events/edit?id=${event.id}`}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700"
        >
          Edit Event
        </Link>
      </div>

      <div className="border-b border-slate-800">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Details</h2>
            {event.description && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-slate-300 text-sm">{event.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Dates</p>
              <p className="text-slate-300 text-sm">
                {formatDate(event.date_start)} &mdash; {formatDate(event.date_end)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Beacon UUID</p>
              <p className="text-slate-300 text-sm font-mono">{event.uuid_namespace}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Created</p>
              <p className="text-slate-300 text-sm">{formatDate(event.created_at)}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-teal-400">{participantCount}</p>
                <p className="text-xs text-slate-500 mt-1">Participants</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-slate-400">0</p>
                <p className="text-xs text-slate-500 mt-1">Beacons</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Participants' && (
        <ParticipantsList eventId={id} />
      )}

      {activeTab === 'Beacons' && (
        <BeaconsList eventId={id} />
      )}

      {activeTab === 'Analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-white">--</p>
              <p className="text-xs text-slate-500 mt-1">Total Encounters</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-white">
                {participantCount > 0 ? '0%' : '--'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Check-in Rate</p>
            </div>
          </div>
          <Link
            href={`/analytics?eventId=${event.id}`}
            className="block text-center bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/20 rounded-xl p-4 text-sm font-medium transition-colors"
          >
            View Full Analytics Dashboard &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
