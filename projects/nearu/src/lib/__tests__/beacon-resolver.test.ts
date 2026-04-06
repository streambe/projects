import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Participant } from '@/lib/types';

const mockSelect = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  },
}));

import { loadEventParticipantMap, resolveBeacon, clearBeaconCache } from '@/lib/api/beacon-resolver';

const makeParticipant = (id: string): Participant => ({
  id,
  full_name: `User ${id}`,
  email: `${id}@test.com`,
  company: null,
  role: null,
  photo_url: null,
  created_at: '2024-01-01',
});

describe('beacon-resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearBeaconCache();
  });

  describe('loadEventParticipantMap', () => {
    it('builds correct Map from event participants', async () => {
      const p1 = makeParticipant('p1');
      const p2 = makeParticipant('p2');
      const data = [
        { beacons: { minor: 100 }, participants: p1 },
        { beacons: { minor: 200 }, participants: p2 },
      ];
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data, error: null }),
      });

      const map = await loadEventParticipantMap('e1');
      expect(map.size).toBe(2);
      expect(map.get(100)).toEqual(p1);
      expect(map.get(200)).toEqual(p2);
    });

    it('skips rows without beacon or participant', async () => {
      const data = [
        { beacons: null, participants: makeParticipant('p1') },
        { beacons: { minor: 300 }, participants: null },
      ];
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data, error: null }),
      });

      const map = await loadEventParticipantMap('e2');
      expect(map.size).toBe(0);
    });

    it('caches result — second call does not re-fetch', async () => {
      const data = [{ beacons: { minor: 100 }, participants: makeParticipant('p1') }];
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data, error: null }),
      });

      const map1 = await loadEventParticipantMap('e3');
      const map2 = await loadEventParticipantMap('e3');
      expect(map1).toBe(map2);
      // select called only once (for the first call)
      expect(mockSelect).toHaveBeenCalledTimes(1);
    });

    it('throws on supabase error', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: new Error('DB fail') }),
      });

      await expect(loadEventParticipantMap('e4')).rejects.toThrow('DB fail');
    });
  });

  describe('resolveBeacon', () => {
    it('returns correct participant for known minorId', () => {
      const p = makeParticipant('p1');
      const map = new Map<number, Participant>([[42, p]]);
      expect(resolveBeacon(42, map)).toEqual(p);
    });

    it('returns null for unknown minorId', () => {
      const map = new Map<number, Participant>();
      expect(resolveBeacon(999, map)).toBeNull();
    });
  });
});
