import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { getEventStats, getTopNetworkers, getEncountersByHour } from '@/lib/api/analytics';

describe('analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEventStats', () => {
    it('returns correct structure with computed fields', async () => {
      // event_participants count queries
      const epSelect = vi.fn();

      // First call: total participants
      // Second call: checked in
      let epCallCount = 0;
      const encounters = [
        { id: 'enc1', participant_a: 'p1', participant_b: 'p2', encounter_count: 3 },
        { id: 'enc2', participant_a: 'p1', participant_b: 'p3', encounter_count: 2 },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'event_participants') {
          epCallCount++;
          if (epCallCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
              }),
            };
          } else {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
                }),
              }),
            };
          }
        }
        if (table === 'encounters') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: encounters, error: null }),
            }),
          };
        }
        return {};
      });

      const stats = await getEventStats('e1');

      expect(stats.totalParticipants).toBe(10);
      expect(stats.checkedIn).toBe(5);
      expect(stats.totalEncounters).toBe(5); // 3 + 2
      expect(stats.uniquePairs).toBe(2);
      expect(stats.avgEncountersPerPerson).toBeGreaterThan(0);
    });

    it('returns zeros when no data', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'event_participants') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
            }),
          };
        }
        if (table === 'encounters') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
        return {};
      });

      // Need to handle the first ep call (without second .eq)
      let epCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'event_participants') {
          epCount++;
          if (epCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
            }),
          };
        }
        if (table === 'encounters') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
        return {};
      });

      const stats = await getEventStats('e1');
      expect(stats.totalEncounters).toBe(0);
      expect(stats.avgEncountersPerPerson).toBe(0);
    });
  });

  describe('getTopNetworkers', () => {
    it('returns sorted array by encounter count', async () => {
      const encounters = [
        { participant_a: 'p1', participant_b: 'p2', encounter_count: 5 },
        { participant_a: 'p1', participant_b: 'p3', encounter_count: 3 },
        { participant_a: 'p2', participant_b: 'p3', encounter_count: 1 },
      ];
      const participants = [
        { id: 'p1', full_name: 'Alice', company: 'Acme', photo_url: null },
        { id: 'p2', full_name: 'Bob', company: null, photo_url: null },
        { id: 'p3', full_name: 'Carol', company: null, photo_url: null },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'encounters') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: encounters, error: null }),
            }),
          };
        }
        if (table === 'participants') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({ data: participants, error: null }),
            }),
          };
        }
        return {};
      });

      const result = await getTopNetworkers('e1');

      // p1 has 5+3=8, p2 has 5+1=6, p3 has 3+1=4
      expect(result[0].fullName).toBe('Alice');
      expect(result[0].encounterCount).toBe(8);
      expect(result[1].fullName).toBe('Bob');
      expect(result[1].encounterCount).toBe(6);
      expect(result[2].fullName).toBe('Carol');
      expect(result[2].encounterCount).toBe(4);
    });

    it('returns empty array when no encounters', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await getTopNetworkers('e1');
      expect(result).toEqual([]);
    });
  });

  describe('getEncountersByHour', () => {
    it('returns hourly data sorted by hour', async () => {
      const encounters = [
        { first_seen: '2024-06-15T09:30:00Z', encounter_count: 2 },
        { first_seen: '2024-06-15T09:45:00Z', encounter_count: 1 },
        { first_seen: '2024-06-15T14:00:00Z', encounter_count: 3 },
      ];

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: encounters, error: null }),
        }),
      });

      const result = await getEncountersByHour('e1');

      // Hours depend on local timezone, so just verify structure
      expect(result).toHaveLength(2);
      // The two 09:30 and 09:45 entries share the same hour bucket
      const totalCount = result.reduce((sum, r) => sum + r.count, 0);
      expect(totalCount).toBe(6); // 2 + 1 + 3
      // Verify sorted
      expect(result[0].hour.localeCompare(result[1].hour)).toBeLessThan(0);
    });

    it('returns empty array when no encounters', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await getEncountersByHour('e1');
      expect(result).toEqual([]);
    });
  });
});
