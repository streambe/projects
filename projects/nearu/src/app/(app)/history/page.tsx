'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import {
  getParticipantEncounters,
  type EncounterWithParticipant,
} from '@/lib/api/encounters';
import { EncounterCard } from '@/components/app/encounter-card';
import { SyncStatus } from '@/components/app/sync-status';

interface DateGroup {
  label: string;
  encounters: EncounterWithParticipant[];
}

function groupByDate(encounters: EncounterWithParticipant[]): DateGroup[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const todayStr = fmt(today);
  const yesterdayStr = fmt(yesterday);

  const map = new Map<string, EncounterWithParticipant[]>();

  for (const enc of encounters) {
    const dateStr = enc.last_seen.slice(0, 10);
    const arr = map.get(dateStr) ?? [];
    arr.push(enc);
    map.set(dateStr, arr);
  }

  const groups: DateGroup[] = [];
  // Sort date keys descending
  const sortedKeys = [...map.keys()].sort((a, b) => b.localeCompare(a));

  for (const key of sortedKeys) {
    let label: string;
    if (key === todayStr) {
      label = 'TODAY';
    } else if (key === yesterdayStr) {
      label = 'YESTERDAY';
    } else {
      label = new Date(key + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).toUpperCase();
    }
    groups.push({ label, encounters: map.get(key)! });
  }

  return groups;
}

export default function HistoryPage() {
  const [groups, setGroups] = useState<DateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const session = getSession();
    if (!session) return;

    try {
      const encounters = await getParticipantEncounters(
        session.event.id,
        session.participant.id,
      );
      setGroups(groupByDate(encounters));
    } catch (err) {
      console.error('Failed to fetch encounters:', err);
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">
          History
        </h1>
        <div className="flex items-center gap-2">
          <SyncStatus />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 transition hover:bg-slate-700 hover:text-slate-200 active:scale-95 disabled:opacity-50"
            aria-label="Refresh"
          >
            <svg
              className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center pt-32">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 pt-32 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <svg
              className="h-8 w-8 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-base font-medium text-slate-300">
            No encounters yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Start walking around! People you meet will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5 px-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.encounters.map((enc) => (
                  <EncounterCard key={enc.id} encounter={enc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
