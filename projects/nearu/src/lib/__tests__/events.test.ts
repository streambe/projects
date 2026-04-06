import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockInsert = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'events') {
        return { select: mockSelect };
      }
      if (table === 'event_participants') {
        return { select: mockSelect, insert: mockInsert };
      }
      return {};
    }),
  },
}));

import {
  getEventById,
  getEventParticipants,
  createEventParticipant,
} from '@/lib/api/events';

describe('events API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEventById', () => {
    it('returns event when found', async () => {
      const event = { id: 'e1', name: 'Test Event' };
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: event, error: null }),
        }),
      });

      const result = await getEventById('e1');
      expect(result).toEqual(event);
    });

    it('returns null when not found', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const result = await getEventById('nonexistent');
      expect(result).toBeNull();
    });

    it('throws on supabase error', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      });

      await expect(getEventById('e1')).rejects.toThrow('DB error');
    });
  });

  describe('getEventParticipants', () => {
    it('returns array of participants', async () => {
      const data = [
        { id: 'ep1', event_id: 'e1', participant_id: 'p1', participants: { id: 'p1', email: 'a@b.com' } },
      ];
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data, error: null }),
      });

      const result = await getEventParticipants('e1');
      expect(result).toHaveLength(1);
      expect(result[0].participants.email).toBe('a@b.com');
    });

    it('returns empty array when no participants', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await getEventParticipants('e1');
      expect(result).toEqual([]);
    });

    it('throws on supabase error', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: new Error('Fail') }),
      });

      await expect(getEventParticipants('e1')).rejects.toThrow('Fail');
    });
  });

  describe('createEventParticipant', () => {
    it('creates participant with 6-char access code', async () => {
      const created = {
        id: 'ep1',
        event_id: 'e1',
        participant_id: 'p1',
        access_code: 'XYZ789',
        checked_in: false,
        checked_in_at: null,
        created_at: '2024-01-01',
      };
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: created, error: null }),
        }),
      });

      const result = await createEventParticipant('e1', 'p1');
      expect(result.event_id).toBe('e1');
      expect(result.participant_id).toBe('p1');
      expect(result.access_code).toBe('XYZ789');
    });

    it('throws on supabase error', async () => {
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: new Error('Conflict') }),
        }),
      });

      await expect(createEventParticipant('e1', 'p1')).rejects.toThrow('Conflict');
    });
  });
});
