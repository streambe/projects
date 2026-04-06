'use client';

import { useEffect, useState } from 'react';
import type { Participant } from '@/lib/types';

interface NearbyPersonCardProps {
  participant: Participant;
  distance: number;
  lastSeen: Date;
  onClick: () => void;
}

function distanceColor(d: number): string {
  if (d < 2) return 'bg-teal-500/15 text-teal-300 border-teal-400/40';
  if (d < 4) return 'bg-yellow-500/15 text-yellow-300 border-yellow-400/40';
  return 'bg-orange-500/15 text-orange-300 border-orange-400/40';
}

function distanceLabel(d: number): string {
  if (d < 1) return `${(d * 100).toFixed(0)}cm`;
  return `${d.toFixed(1)}m`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function ProximityIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4a8 8 0 0 1 8 8" strokeLinecap="round" />
      <path d="M12 7.5a4.5 4.5 0 0 1 4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

export function NearbyPersonCard({
  participant,
  distance,
  lastSeen,
  onClick,
}: NearbyPersonCardProps) {
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsNew(false), 800);
    return () => clearTimeout(t);
  }, []);

  const ago = Math.round((Date.now() - lastSeen.getTime()) / 1000);
  const stale = ago > 15;

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl
        border border-slate-800/80 bg-slate-900/70 p-3 text-left backdrop-blur-md
        transition-all duration-200
        hover:-translate-y-0.5 hover:border-teal-500/30 hover:bg-slate-800/70
        hover:shadow-[0_12px_32px_-12px_rgba(20,184,166,0.25)]
        active:scale-[0.98] active:translate-y-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400
        ${isNew ? 'animate-fade-in-up' : ''}
        ${stale ? 'opacity-60' : ''}
      `}
    >
      {/* Subtle teal glow on hover */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/0 to-teal-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:from-teal-500/5 group-hover:via-teal-500/0 group-hover:to-teal-500/0" />

      {/* Avatar */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-800 ring-2 ring-slate-800/60">
        {participant.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={participant.photo_url}
            alt={participant.full_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500 to-teal-800 text-sm font-semibold text-white">
            {initials(participant.full_name)}
          </div>
        )}
        {/* Online / active dot */}
        {!stale && (
          <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-slate-900 bg-teal-400" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="relative min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {participant.full_name}
        </p>
        {(participant.company || participant.role) && (
          <p className="truncate text-xs text-slate-400">
            {[participant.role, participant.company].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* Distance pill */}
      <div
        className={`relative flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums ${distanceColor(distance)}`}
      >
        <ProximityIcon />
        {distanceLabel(distance)}
      </div>
    </button>
  );
}
