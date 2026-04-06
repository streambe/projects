import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { getParticipantEncounters, createOrUpdateEncounter } from '@/lib/api/encounters';

describe('encounters API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getParticipantEncounters', () => {
    it('returns encounters where participant is A or B', async () => {
      const encounters = [
        { id: 'enc1', event_id: 'e1', participant_a: 'p1', participant_b: 'p2', first_seen: '', last_seen: '', total_duration: null, encounter_count: 1 },
        { id: 'enc2', event_id: 'e1', participant_a: 'p3', participant_b: 'p1', first_seen: '', last_seen: '', total_duration: null, encounter_count: 2 },
      ];
      const participants = [
        { id: 'p2', full_name: 'User 2', email: null, company: null, role: null, photo_url: null, created_at: '' },
        { id: 'p3', full_name: 'User 3', email: null, company: null, role: null, photo_url: null, created_at: '' },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'encounters') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                or: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: encounters, error: null }),
                }),
              }),
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

      const result = await getParticipantEncounters('e1', 'p1');
      expect(result).toHaveLength(2);
      expect(result[0].otherParticipant.id).toBe('p2');
      expect(result[1].otherParticipant.id).toBe('p3');
    });

    it('returns empty array when no encounters', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      });

      const result = await getParticipantEncounters('e1', 'p1');
      expect(result).toEqual([]);
    });

    it('throws on supabase error', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: null, error: new Error('Fail') }),
            }),
          }),
        }),
      });

      await expect(getParticipantEncounters('e1', 'p1')).rejects.toThrow('Fail');
    });
  });

  describe('createOrUpdateEncounter', () => {
    it('sorts participant IDs so A < B', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
        insert: insertMock,
      });

      // Pass B before A — should still sort
      await createOrUpdateEncounter('e1', 'zzz', 'aaa', 1.5);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          participant_a: 'aaa',
          participant_b: 'zzz',
        }),
      );
    });

    it('creates new encounter when none exists', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
        insert: insertMock,
      });

      await createOrUpdateEncounter('e1', 'p1', 'p2', 2.0);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event_id: 'e1',
          encounter_count: 1,
          total_duration: '0 seconds',
        }),
      );
    });

    it('updates existing encounter', async () => {
      const existing = {
        id: 'enc1',
        first_seen: '2024-06-15T11:00:00Z',
        encounter_count: 3,
      };
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: existing, error: null }),
              }),
            }),
          }),
        }),
        update: updateMock,
      });

      await createOrUpdateEncounter('e1', 'p1', 'p2', 1.0);

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          encounter_count: 4,
        }),
      );
    });
  });
});
