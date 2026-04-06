import { supabase } from '@/lib/supabase';
import type { Participant } from '@/lib/types';

/** In-memory cache keyed by eventId. */
const cache = new Map<string, Map<number, Participant>>();

/**
 * Loads all event participants with their beacon minor IDs
 * and builds a Map<minorId, Participant> for fast lookup.
 *
 * Results are cached in memory — beacons don't change during an event.
 */
export async function loadEventParticipantMap(
  eventId: string,
): Promise<Map<number, Participant>> {
  const cached = cache.get(eventId);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      *,
      participants (*),
      beacons:beacon_id (*)
    `)
    .eq('event_id', eventId);

  if (error) throw error;

  const map = new Map<number, Participant>();

  for (const row of data ?? []) {
    const beacon = row.beacons as { minor: number } | null;
    const participant = row.participants as unknown as Participant | null;

    if (beacon && participant) {
      map.set(beacon.minor, participant);
    }
  }

  cache.set(eventId, map);
  return map;
}

/**
 * Resolve a beacon minor ID to a Participant.
 */
export function resolveBeacon(
  minorId: number,
  map: Map<number, Participant>,
): Participant | null {
  return map.get(minorId) ?? null;
}

/**
 * Clear cached data (useful on logout).
 */
export function clearBeaconCache(): void {
  cache.clear();
}
