'use client';

const QUEUE_KEY = 'nearu_offline_queue';

export interface OfflineProximityEvent {
  eventId: string;
  detectorParticipantId: string;
  detectedBeaconMinor: number;
  rssi: number;
  estimatedDistance: number;
  detectedAt: string;
}

function readQueue(): OfflineProximityEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineProximityEvent[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function queueProximityEvent(event: OfflineProximityEvent): void {
  const queue = readQueue();
  queue.push(event);
  writeQueue(queue);
}

export function getQueuedEvents(): OfflineProximityEvent[] {
  return readQueue();
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

export function removeFromQueue(count: number): void {
  const queue = readQueue();
  writeQueue(queue.slice(count));
}

export function getQueueSize(): number {
  return readQueue().length;
}
