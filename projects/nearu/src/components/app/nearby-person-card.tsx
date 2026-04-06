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
  if (d < 2) return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
  if (d < 4) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
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

export function NearbyPersonCard({
  participant,
  distance,
  lastSeen,
  onClick,
}: NearbyPersonCardProps) {
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsNew(false), 600);
    return () => clearTimeout(t);
  }, []);

  const ago = Math.round((Date.now() - lastSeen.getTime()) / 1000);
  const stale = ago > 15;

  return (
    <button
      onClick={onClick}
      className={`
        group flex w-full items-center gap-3 rounded-2xl border border-slate-800
        bg-slate-900 p-3 text-left transition-all duration-300
        hover:border-slate-700 hover:bg-slate-800/80
        active:scale-[0.98]
        ${isNew ? 'animate-card-in' : ''}
        ${stale ? 'opacity-60' : ''}
      `}
    >
      {/* Avatar */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-800">
        {participant.photo_url ? (
          <img
            src={participant.photo_url}
            alt={participant.full_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-600 to-teal-800 text-sm font-semibold text-white">
            {initials(participant.full_name)}
          </div>
        )}
        {/* Online pulse */}
        {!stale && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-teal-400" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {participant.full_name}
        </p>
        {(participant.company || participant.role) && (
          <p className="truncate text-xs text-slate-400">
            {[participant.role, participant.company].filter(Boolean).join(' @ ')}
          </p>
        )}
      </div>

      {/* Distance badge */}
      <div
        className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium tabular-nums ${distanceColor(distance)}`}
      >
        {distanceLabel(distance)}
      </div>
    </button>
  );
}
