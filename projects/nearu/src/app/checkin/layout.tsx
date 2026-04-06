'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface EventOption {
  id: string;
  name: string;
  status: string;
}

interface CheckinCtx {
  eventId: string;
  eventName: string;
}

const CheckinContext = createContext<CheckinCtx | null>(null);

export function useCheckinEvent() {
  const ctx = useContext(CheckinContext);
  if (!ctx) throw new Error('useCheckinEvent must be used within CheckinLayout with a selected event');
  return ctx;
}

export default function CheckinLayout({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventOption | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('id, name, status')
        .eq('status', 'live')
        .order('date_start', { ascending: false });
      setEvents(data ?? []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/checkin" className="text-xl font-bold tracking-tight">
            near<span className="text-teal-500">U</span>{' '}
            <span className="text-sm font-normal text-slate-400">CHECK-IN</span>
          </Link>
          {selectedEvent && (
            <span className="text-sm text-teal-400 border-l border-slate-700 pl-4">
              {selectedEvent.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectedEvent && (
            <button
              onClick={() => setSelectedEvent(null)}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Change Event
            </button>
          )}
          <Link
            href="/checkin/returns"
            className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Beacon Returns
          </Link>
          <Link
            href="/events"
            className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Backoffice
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-slate-500">Loading events...</div>
          </div>
        ) : !selectedEvent ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-6 text-center">
              <h2 className="text-2xl font-bold">Select Event</h2>
              <p className="text-slate-400">Choose a live event to start check-in.</p>
              {events.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-slate-500">
                  No live events found. Set an event status to &quot;live&quot; in the backoffice.
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="w-full px-6 py-4 bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-xl text-left transition-colors group"
                    >
                      <span className="text-lg font-medium group-hover:text-teal-400 transition-colors">
                        {ev.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <CheckinContext.Provider value={{ eventId: selectedEvent.id, eventName: selectedEvent.name }}>
            {children}
          </CheckinContext.Provider>
        )}
      </main>
    </div>
  );
}
