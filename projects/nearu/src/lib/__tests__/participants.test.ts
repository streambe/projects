import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'participants') {
        return {
          select: mockSelect,
          update: mockUpdate,
        };
      }
      if (table === 'event_participants') {
        return {
          select: mockSelect,
        };
      }
      return {};
    }),
  },
}));

import {
  getParticipantByEmail,
  updateParticipant,
  getParticipantByAccessCode,
} from '@/lib/api/participants';

describe('participants API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getParticipantByEmail', () => {
    it('returns participant when found', async () => {
      const participant = { id: 'p1', email: 'jane@test.com', full_name: 'Jane Doe' };
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: participant, error: null }),
        }),
      });

      const result = await getParticipantByEmail('jane@test.com');
      expect(result).toEqual(participant);
    });

    it('returns null when not found', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const result = await getParticipantByEmail('missing@test.com');
      expect(result).toBeNull();
    });

    it('throws on supabase error', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      });

      await expect(getParticipantByEmail('x@test.com')).rejects.toThrow('DB error');
    });
  });

  describe('updateParticipant', () => {
    it('returns updated participant on success', async () => {
      const updated = { id: 'p1', email: 'jane@test.com', full_name: 'Janet Doe' };
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updated, error: null }),
          }),
        }),
      });

      const result = await updateParticipant('p1', { full_name: 'Janet Doe' });
      expect(result.full_name).toBe('Janet Doe');
    });

    it('throws on supabase error', async () => {
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
          }),
        }),
      });

      await expect(updateParticipant('bad-id', { full_name: 'X' })).rejects.toThrow('Not found');
    });
  });

  describe('getParticipantByAccessCode', () => {
    it('returns session when valid code', async () => {
      const row = {
        id: 'ep1',
        event_id: 'e1',
        participant_id: 'p1',
        access_code: 'ABC123',
        checked_in: false,
        checked_in_at: null,
        beacon_id: null,
        participants: { id: 'p1', full_name: 'Jane Doe', email: 'jane@test.com', company: null, role: null, photo_url: null, created_at: '2024-01-01' },
        events: { id: 'e1', name: 'Test', description: null, location: null, date_start: '2024-06-01', date_end: '2024-06-02', uuid_namespace: '00000000-0000-0000-0000-000000000000', status: 'live', logo_url: null, created_by: null, created_at: '2024-01-01' },
      };
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
        }),
      });

      const result = await getParticipantByAccessCode('abc123');
      expect(result).not.toBeNull();
      expect(result!.participant.id).toBe('p1');
      expect(result!.event.id).toBe('e1');
      expect(result!.eventParticipant.access_code).toBe('ABC123');
    });

    it('returns null for invalid code', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const result = await getParticipantByAccessCode('XXXXXX');
      expect(result).toBeNull();
    });

    it('trims and uppercases the code', async () => {
      const eqMock = vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      });
      mockSelect.mockReturnValue({ eq: eqMock });

      await getParticipantByAccessCode('  abc123  ');
      expect(eqMock).toHaveBeenCalledWith('access_code', 'ABC123');
    });

    it('throws on supabase error', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('DB fail') }),
        }),
      });

      await expect(getParticipantByAccessCode('ABC123')).rejects.toThrow('DB fail');
    });
  });
});
