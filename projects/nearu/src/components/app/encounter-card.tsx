'use client';

import type { EncounterWithParticipant } from '@/lib/api/encounters';

interface EncounterCardProps {
  encounter: EncounterWithParticipant;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(pgInterval: string | null): string {
  if (!pgInterval) return '--';
  // Parse postgres interval like "120 seconds" or "00:02:00"
  const secMatch = pgInterval.match(/^(\d+)\s*seconds?$/i);
  if (secMatch) {
    const totalSec = parseInt(secMatch[1], 10);
    if (totalSec < 60) return `${totalSec}s`;
    return `${Math.floor(totalSec / 60)} min`;
  }
  // Try HH:MM:SS format
  const hmsMatch = pgInterval.match(/(\d+):(\d+):(\d+)/);
  if (hmsMatch) {
    const h = parseInt(hmsMatch[1], 10);
    const m = parseInt(hmsMatch[2], 10);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m} min`;
    return `${parseInt(hmsMatch[3], 10)}s`;
  }
  return pgInterval;
}

export function EncounterCard({ encounter }: EncounterCardProps) {
  const person = encounter.otherParticipant;
  const initials = person.full_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 px-4 py-3 border border-slate-800/60">
      {/* Avatar */}
      {person.photo_url ? (
        <img
          src={person.photo_url}
          alt={person.full_name}
          className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-slate-700"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-900/40 ring-2 ring-teal-700/40">
          <span className="text-sm font-semibold text-teal-300">
            {initials}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-100">
          {person.full_name}
        </p>
        {(person.company || person.role) && (
          <p className="truncate text-xs text-slate-400">
            {[person.role, person.company].filter(Boolean).join(' at ')}
          </p>
        )}
      </div>

      {/* Time & duration */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-medium text-slate-300">
          {formatTime(encounter.last_seen)}
        </p>
        <p className="text-xs text-slate-500">
          {formatDuration(encounter.total_duration)}
        </p>
      </div>
    </div>
  );
}
