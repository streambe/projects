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

  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Nearby</h1>
            <p className="text-xs text-slate-500">
              {isScanning
                ? count > 0
                  ? `${count} ${count === 1 ? 'person' : 'people'} nearby`
                  : 'Scanning...'
                : 'Not scanning'}
            </p>
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className={`relative rounded-xl border p-2.5 transition ${
              hasActiveFilters(filters)
                ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            {hasActiveFilters(filters) && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-teal-500" />
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Content */}
        {isScanning && count === 0 && !error && (
          <ScanningIndicator />
        )}

        {!isScanning && count === 0 && !error && (
          <EmptyState message="No one nearby yet. Walk around to discover people!" />
        )}

        {count > 0 && (
          <div className="flex flex-col gap-2">
            {filteredPeople.map((person) => (
              <NearbyPersonCard
                key={person.participant.id}
                participant={person.participant}
                distance={person.distance}
                lastSeen={person.lastSeen}
                onClick={() => handlePersonClick(person.participant.id)}
              />
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
