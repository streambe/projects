'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useBleScanner } from '@/hooks/useBleScanner';
import { queueProximityEvent } from '@/lib/offline-store';
import { startAutoSync } from '@/lib/sync-service';
import { createOrUpdateEncounter } from '@/lib/api/encounters';
import type { BeaconDetection } from '@/plugins/ble/definitions';

interface UseProximityTrackerOptions {
  eventId: string;
  participantId: string;
  eventUuid: string;
  /** Map of beacon minor ID -> participant ID, for resolving encounters */
  beaconToParticipant: Map<number, string>;
}

/**
 * Glue hook combining BLE scanning + offline queue + encounter creation.
 * On each beacon detection:
 *   1. Queue proximity event to offline store
 *   2. Resolve beacon minor -> participant and create/update encounter
 * Auto-sync runs periodically in the background.
 */
export function useProximityTracker({
  eventId,
  participantId,
  eventUuid,
  beaconToParticipant,
}: UseProximityTrackerOptions) {
  const scanner = useBleScanner();
  const cleanupSyncRef = useRef<(() => void) | null>(null);
  const prevBeaconsRef = useRef<BeaconDetection[]>([]);

  // Start auto-sync on mount
  useEffect(() => {
    cleanupSyncRef.current = startAutoSync(30_000);
    return () => {
      cleanupSyncRef.current?.();
    };
  }, []);

  // Process new beacon detections
  useEffect(() => {
    const current = scanner.nearbyBeacons;
    if (current === prevBeaconsRef.current) return;
    prevBeaconsRef.current = current;

    for (const beacon of current) {
      // Queue to offline store
      queueProximityEvent({
        eventId,
        detectorParticipantId: participantId,
        detectedBeaconMinor: beacon.minorId,
        rssi: beacon.rssi,
        estimatedDistance: beacon.estimatedDistance,
        detectedAt: new Date(beacon.timestamp).toISOString(),
      });

      // Resolve and create encounter if we know the participant
      const otherParticipantId = beaconToParticipant.get(beacon.minorId);
      if (otherParticipantId && otherParticipantId !== participantId) {
        createOrUpdateEncounter(
          eventId,
          participantId,
          otherParticipantId,
          beacon.estimatedDistance,
        ).catch(() => {
          // Will retry via sync
        });
      }
    }
  }, [scanner.nearbyBeacons, eventId, participantId, beaconToParticipant]);

  const start = useCallback(async () => {
    await scanner.startScanning(eventUuid);
  }, [scanner, eventUuid]);

  const stop = useCallback(async () => {
    await scanner.stopScanning();
  }, [scanner]);

  return {
    nearbyBeacons: scanner.nearbyBeacons,
    isScanning: scanner.isScanning,
    error: scanner.error,
    start,
    stop,
  };
}
