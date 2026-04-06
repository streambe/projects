import { describe, it, expect, beforeEach } from 'vitest';
import type { OfflineProximityEvent } from '@/lib/offline-store';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  length: 0,
  key: () => null,
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });
Object.defineProperty(globalThis, 'window', { value: globalThis, writable: true });

import {
  queueProximityEvent,
  getQueuedEvents,
  clearQueue,
  getQueueSize,
} from '@/lib/offline-store';

const makeEvent = (id: string): OfflineProximityEvent => ({
  eventId: 'e1',
  detectorParticipantId: id,
  detectedBeaconMinor: 100,
  rssi: -60,
  estimatedDistance: 2.5,
  detectedAt: '2024-06-15T12:00:00Z',
});

describe('offline-store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('queueProximityEvent adds to queue', () => {
    queueProximityEvent(makeEvent('p1'));
    expect(getQueueSize()).toBe(1);
  });

  it('getQueuedEvents returns all items', () => {
    queueProximityEvent(makeEvent('p1'));
    queueProximityEvent(makeEvent('p2'));
    const events = getQueuedEvents();
    expect(events).toHaveLength(2);
    expect(events[0].detectorParticipantId).toBe('p1');
    expect(events[1].detectorParticipantId).toBe('p2');
  });

  it('clearQueue empties the queue', () => {
    queueProximityEvent(makeEvent('p1'));
    queueProximityEvent(makeEvent('p2'));
    clearQueue();
    expect(getQueueSize()).toBe(0);
    expect(getQueuedEvents()).toEqual([]);
  });

  it('getQueueSize returns correct count', () => {
    expect(getQueueSize()).toBe(0);
    queueProximityEvent(makeEvent('p1'));
    expect(getQueueSize()).toBe(1);
    queueProximityEvent(makeEvent('p2'));
    expect(getQueueSize()).toBe(2);
  });

  it('queue persists across reads (localStorage backed)', () => {
    queueProximityEvent(makeEvent('p1'));
    // Reading raw localStorage to verify persistence
    const raw = localStorage.getItem('nearu_offline_queue');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].detectorParticipantId).toBe('p1');
  });

  it('returns empty array when localStorage is empty', () => {
    expect(getQueuedEvents()).toEqual([]);
    expect(getQueueSize()).toBe(0);
  });
});
