'use client';

import { useCallback, useEffect, useRef } from 'react';
import { sendLocalNotification, hasPermission } from '@/lib/notifications';
import type { Participant } from '@/lib/types';

/** Cooldown before re-notifying about the same person (ms). */
const NOTIFY_COOLDOWN_MS = 60_000;

interface UseNotificationsOptions {
  /** Map of beacon minorId -> Participant for resolving names. */
  beaconToParticipant: Map<number, Participant>;
  /** Currently detected beacon minor IDs with timestamps. */
  nearbyBeacons: Array<{ minorId: number; timestamp: number }>;
  /** Whether notifications are enabled by the user. */
  enabled: boolean;
}

/**
 * Hook that fires local notifications when a NEW person enters range.
 * Tracks a cooldown per minorId to avoid spamming.
 */
export function useNotifications({
  beaconToParticipant,
  nearbyBeacons,
  enabled,
}: UseNotificationsOptions) {
  // Map of minorId -> last notification timestamp
  const lastNotifiedRef = useRef<Map<number, number>>(new Map());
  // Track which minorIds were seen in the previous render
  const prevMinorIdsRef = useRef<Set<number>>(new Set());

  const notify = useCallback(
    (participant: Participant) => {
      if (!enabled || !hasPermission()) return;

      const company = participant.company
        ? ` from ${participant.company}`
        : '';
      sendLocalNotification(
        'Someone nearby!',
        `${participant.full_name}${company} is near you`,
        { participantId: participant.id },
      );
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) return;

    const now = Date.now();
    const currentMinorIds = new Set<number>();

    for (const beacon of nearbyBeacons) {
      currentMinorIds.add(beacon.minorId);

      const lastNotified = lastNotifiedRef.current.get(beacon.minorId);
      const wasSeenBefore = prevMinorIdsRef.current.has(beacon.minorId);

      // Only notify if: new person (not seen last render) OR cooldown expired
      const cooldownExpired =
        lastNotified === undefined || now - lastNotified > NOTIFY_COOLDOWN_MS;

      if (!wasSeenBefore && cooldownExpired) {
        const participant = beaconToParticipant.get(beacon.minorId);
        if (participant) {
          notify(participant);
          lastNotifiedRef.current.set(beacon.minorId, now);
        }
      }
    }

    // Clean up entries for people who have been out of range for 60s+
    for (const [minorId, lastTime] of lastNotifiedRef.current) {
      if (!currentMinorIds.has(minorId) && now - lastTime > NOTIFY_COOLDOWN_MS) {
        lastNotifiedRef.current.delete(minorId);
      }
    }

    prevMinorIdsRef.current = currentMinorIds;
  }, [nearbyBeacons, beaconToParticipant, enabled, notify]);
}
