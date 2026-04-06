'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { loadEventParticipantMap } from '@/lib/api/beacon-resolver';
import { useBleScanner } from '@/hooks/useBleScanner';
import type { Participant } from '@/lib/types';

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function distanceBadge(d: number) {
  if (d < 2) return { label: 'Very close', cls: 'bg-teal-500/20 text-teal-400' };
  if (d < 4) return { label: 'Nearby', cls: 'bg-yellow-500/20 text-yellow-400' };
  return { label: 'In range', cls: 'bg-orange-500/20 text-orange-400' };
}

export default function PersonDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantId = searchParams.get('id');

  const [participant, setParticipant] = useState<Participant | null>(null);
  const { nearbyBeacons } = useBleScanner();
  const [participantMap, setParticipantMap] = useState<Map<number, Participant>>(
    new Map(),
  );

  useEffect(() => {
    const session = getSession();
    if (!session || !participantId) return;

    loadEventParticipantMap(session.event.id).then((map) => {
      setParticipantMap(map);
      // Find participant in map
      for (const [, p] of map) {
        if (p.id === participantId) {
          setParticipant(p);
          return;
        }
      }
    });
  }, [participantId]);

  // Find current beacon for this participant
  const currentBeacon = useMemo(() => {
    if (!participant || participantMap.size === 0) return null;
    for (const [minorId, p] of participantMap) {
      if (p.id === participant.id) {
        return nearbyBeacons.find((b) => b.minorId === minorId) ?? null;
      }
    }
    return null;
  }, [participant, participantMap, nearbyBeacons]);

  if (!participant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const badge = currentBeacon ? distanceBadge(currentBeacon.estimatedDistance) : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-950 px-4 pb-24 pt-4">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Avatar */}
      <div className="mb-5 flex justify-center">
        <div className="relative h-28 w-28 overflow-hidden rounded-full bg-slate-800">
          {participant.photo_url ? (
            <img
              src={participant.photo_url}
              alt={participant.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-600 to-teal-800 text-3xl font-bold text-white">
              {initials(participant.full_name)}
            </div>
          )}
          {currentBeacon && (
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-teal-400" />
          )}
        </div>
      </div>

      {/* Name */}
      <h1 className="text-center text-2xl font-bold text-white">
        {participant.full_name}
      </h1>

      {/* Role & Company */}
      {(participant.role || participant.company) && (
        <p className="mt-1 text-center text-sm text-slate-400">
          {[participant.role, participant.company].filter(Boolean).join(' @ ')}
        </p>
      )}

      {/* Distance badge */}
      {badge && (
        <div className="mt-3 flex justify-center">
          <span className={`rounded-full px-4 py-1.5 text-xs font-medium ${badge.cls}`}>
            {badge.label} &mdash; {currentBeacon!.estimatedDistance.toFixed(1)}m
          </span>
        </div>
      )}

      {/* Info cards */}
      <div className="mt-8 flex flex-col gap-3">
        {participant.email && (
          <InfoRow label="Email" value={participant.email} />
        )}
        {participant.company && (
          <InfoRow label="Company" value={participant.company} />
        )}
        {participant.role && (
          <InfoRow label="Role" value={participant.role} />
        )}
        {currentBeacon && (
          <InfoRow
            label="Distance"
            value={`${currentBeacon.estimatedDistance.toFixed(1)}m away`}
          />
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-white">{value}</p>
    </div>
  );
}
