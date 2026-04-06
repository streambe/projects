'use client';

import { supabase } from '@/lib/supabase';
import { getQueuedEvents, removeFromQueue } from '@/lib/offline-store';

const BATCH_SIZE = 100;

export async function syncProximityEvents(): Promise<{
  synced: number;
  failed: number;
}> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const queue = getQueuedEvents();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  // Process in batches
  const batch = queue.slice(0, BATCH_SIZE);

  const rows = batch.map((evt) => ({
    event_id: evt.eventId,
    observer_id: evt.detectorParticipantId,
    observed_id: evt.detectedBeaconMinor.toString(),
    rssi: evt.rssi,
    distance_m: evt.estimatedDistance,
    detected_at: evt.detectedAt,
    synced: true,
  }));

  const { error } = await supabase.from('proximity_events').insert(rows);

  if (error) {
    failed = batch.length;
  } else {
    synced = batch.length;
    removeFromQueue(batch.length);
  }

  return { synced, failed };
}

export function startAutoSync(intervalMs: number = 30000): () => void {
  const id = setInterval(() => {
    syncProximityEvents().catch(() => {
      // Silently fail — will retry next interval
    });
  }, intervalMs);

  // Run once immediately
  syncProximityEvents().catch(() => {});

  return () => clearInterval(id);
}
