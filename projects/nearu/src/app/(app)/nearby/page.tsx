'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { useBleScanner } from '@/hooks/useBleScanner';
import { useNotifications } from '@/hooks/useNotifications';
import {
  loadEventParticipantMap,
  resolveBeacon,
} from '@/lib/api/beacon-resolver';
import { createOrUpdateEncounter } from '@/lib/api/encounters';
import { queueProximityEvent } from '@/lib/offline-store';
import { getNotificationPreferences } from '@/components/app/notification-settings';
import { NearbyPersonCard } from '@/components/app/nearby-person-card';
import {
  NearbyFilter,
  applyFilters,
  hasActiveFilters,
  emptyFilters,
} from '@/components/app/nearby-filter';
import type { NearbyFilters } from '@/components/app/nearby-filter';
import {
  ScanningIndicator,
  EmptyState,
} from '@/components/app/scanning-indicator';
import { SkeletonPersonCard } from '@/components/ui/skeleton';
import type { Participant } from '@/lib/types';

interface NearbyPerson {
  participant: Participant;
  distance: number;
  lastSeen: Date;
}

export default function NearbyPage() {
  const router = useRouter();
  const { nearbyBeacons, isScanning, error, startScanning } = useBleScanner();
  const [participantMap, setParticipantMap] = useState<Map<number, Participant>>(
    new Map(),
  );
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<NearbyFilters>(emptyFilters);
  const initRef = useRef(false);
  const sessionRef = useRef(getSession());

  // Load session and start scanning
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const session = sessionRef.current;
    if (!session) return;

    const eventId = session.event.id;
    const beaconUuid = session.event.uuid_namespace;

    Promise.all([
      loadEventParticipantMap(eventId).then(setParticipantMap),
      startScanning(beaconUuid),
    ]).catch(console.error);
  }, [startScanning]);

  // --- Proximity tracking: queue offline events + create encounters ---
  const prevBeaconsRef = useRef(nearbyBeacons);
  useEffect(() => {
    if (nearbyBeacons === prevBeaconsRef.current) return;
    prevBeaconsRef.current = nearbyBeacons;

    const session = sessionRef.current;
    if (!session || participantMap.size === 0) return;

    const eventId = session.event.id;
    const myId = session.participant.id;

    for (const beacon of nearbyBeacons) {
      // Queue to offline store
      queueProximityEvent({
        eventId,
        detectorParticipantId: myId,
        detectedBeaconMinor: beacon.minorId,
        rssi: beacon.rssi,
        estimatedDistance: beacon.estimatedDistance,
        detectedAt: new Date(beacon.timestamp).toISOString(),
      });

      // Create/update encounter
      const other = resolveBeacon(beacon.minorId, participantMap);
      if (other && other.id !== myId) {
        createOrUpdateEncounter(eventId, myId, other.id, beacon.estimatedDistance).catch(() => {});
      }
    }
  }, [nearbyBeacons, participantMap]);

  // --- Local notifications for new nearby people ---
  const notifPrefs = useMemo(() => getNotificationPreferences(), []);
  useNotifications({
    beaconToParticipant: participantMap,
    nearbyBeacons,
    enabled: notifPrefs.nearbyEnabled,
  });

  // Resolve beacons to people (for UI display)
  const nearbyPeople = useMemo<NearbyPerson[]>(() => {
    if (participantMap.size === 0) return [];

    const myParticipantId = sessionRef.current?.participant.id;

    const people: NearbyPerson[] = [];
    for (const beacon of nearbyBeacons) {
      const participant = resolveBeacon(beacon.minorId, participantMap);
      if (participant && participant.id !== myParticipantId) {
        people.push({
          participant,
          distance: beacon.estimatedDistance,
          lastSeen: new Date(beacon.timestamp),
        });
      }
    }
    return people.sort((a, b) => a.distance - b.distance);
  }, [nearbyBeacons, participantMap]);

  // Apply filters
  const filteredPeople = useMemo(() => {
    if (!hasActiveFilters(filters)) return nearbyPeople;
    return nearbyPeople.filter((p) => applyFilters(p.participant, filters));
  }, [nearbyPeople, filters]);

  // All unique participants for filter chip extraction
  const allParticipants = useMemo(
    () => nearbyPeople.map((p) => p.participant),
    [nearbyPeople],
  );

  const handlePersonClick = useCallback(
    (participantId: string) => {
      router.push(`/person?id=${participantId}`);
    },
    [router],
  );

  const count = filteredPeople.length;
  const eventName = sessionRef.current?.event.name;
  const isLoadingInitial =
    isScanning && count === 0 && !error && participantMap.size === 0;

  return (
    <>
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-app-ambient px-4 pb-24">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 -mx-4 mb-3 border-b border-slate-800/60 bg-slate-950/80 px-4 pb-3 pt-4 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Nearby
                </h1>
                {isScanning && (
                  <span className="flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-dot-pulse" />
                    Live
                  </span>
                )}
              </div>
              {eventName && (
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {eventName}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {count > 0 && (
                <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-teal-300">
                  {count} {count === 1 ? 'person' : 'people'}
                </span>
              )}
              <button
                onClick={() => setShowFilter(true)}
                aria-label="Filter nearby people"
                className={`relative rounded-xl border p-2.5 transition ${
                  hasActiveFilters(filters)
                    ? 'border-teal-500/40 bg-teal-500/10 text-teal-300'
                    : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                </svg>
                {hasActiveFilters(filters) && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in-up">
            {error}
          </div>
        )}

        {/* Content */}
        {isLoadingInitial && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonPersonCard key={i} />
            ))}
          </div>
        )}

        {isScanning && count === 0 && !error && !isLoadingInitial && (
          <ScanningIndicator />
        )}

        {!isScanning && count === 0 && !error && (
          <EmptyState message="Walk around to discover people at the event." />
        )}

        {count > 0 && (
          <div className="flex flex-col gap-2">
            {filteredPeople.map((person, idx) => (
              <div
                key={person.participant.id}
                className={`animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}
              >
                <NearbyPersonCard
                  participant={person.participant}
                  distance={person.distance}
                  lastSeen={person.lastSeen}
                  onClick={() => handlePersonClick(person.participant.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter overlay */}
      {showFilter && (
        <NearbyFilter
          participants={allParticipants}
          filters={filters}
          onApply={setFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </>
  );
}
