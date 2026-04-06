import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock offline-store
const mockGetQueuedEvents = vi.fn();
const mockRemoveFromQueue = vi.fn();

vi.mock('@/lib/offline-store', () => ({
  getQueuedEvents: () => mockGetQueuedEvents(),
  removeFromQueue: (...args: unknown[]) => mockRemoveFromQueue(...args),
}));

const mockInsert = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  },
}));

import { syncProximityEvents } from '@/lib/sync-service';

const makeQueueItem = (id: string) => ({
  eventId: 'e1',
  detectorParticipantId: id,
  detectedBeaconMinor: 100,
  rssi: -60,
  estimatedDistance: 2.5,
  detectedAt: '2024-06-15T12:00:00Z',
});

describe('sync-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: online
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
  });

  it('sends batch to Supabase and clears queue on success', async () => {
    const items = [makeQueueItem('p1'), makeQueueItem('p2')];
    mockGetQueuedEvents.mockReturnValue(items);
    mockInsert.mockResolvedValue({ error: null });

    const result = await syncProximityEvents();

    expect(result.synced).toBe(2);
    expect(result.failed).toBe(0);
    expect(mockRemoveFromQueue).toHaveBeenCalledWith(2);
  });

  it('keeps queue on failure', async () => {
    const items = [makeQueueItem('p1')];
    mockGetQueuedEvents.mockReturnValue(items);
    mockInsert.mockResolvedValue({ error: new Error('Insert fail') });

    const result = await syncProximityEvents();

    expect(result.synced).toBe(0);
    expect(result.failed).toBe(1);
    expect(mockRemoveFromQueue).not.toHaveBeenCalled();
  });

  it('handles empty queue gracefully', async () => {
    mockGetQueuedEvents.mockReturnValue([]);

    const result = await syncProximityEvents();

    expect(result).toEqual({ synced: 0, failed: 0 });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('respects navigator.onLine — skips sync when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    const result = await syncProximityEvents();

    expect(result).toEqual({ synced: 0, failed: 0 });
    expect(mockGetQueuedEvents).not.toHaveBeenCalled();
  });
});
