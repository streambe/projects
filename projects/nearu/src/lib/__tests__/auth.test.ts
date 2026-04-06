import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AuthSession } from '@/lib/types';

// Mock localStorage for node environment
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

import { getSession, setSession, clearSession, isLoggedIn } from '@/lib/auth';

const mockSession: AuthSession = {
  participant: {
    id: 'p1',
    full_name: 'Jane Doe',
    email: 'jane@example.com',
    company: 'Acme',
    role: 'Engineer',
    photo_url: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  event: {
    id: 'e1',
    name: 'Test Event',
    description: null,
    location: null,
    date_start: '2024-06-01T00:00:00Z',
    date_end: '2024-06-02T00:00:00Z',
    uuid_namespace: '00000000-0000-0000-0000-000000000000',
    status: 'live',
    logo_url: null,
    created_by: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  eventParticipant: {
    id: 'ep1',
    event_id: 'e1',
    participant_id: 'p1',
    access_code: 'ABC123',
    checked_in: false,
    checked_in_at: null,
    beacon_id: null,
  },
};

describe('auth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getSession', () => {
    it('returns null when no session stored', () => {
      expect(getSession()).toBeNull();
    });

    it('returns parsed session when stored', () => {
      localStorage.setItem('nearu_session', JSON.stringify(mockSession));
      expect(getSession()).toEqual(mockSession);
    });

    it('returns null on malformed JSON', () => {
      localStorage.setItem('nearu_session', 'not-json');
      expect(getSession()).toBeNull();
    });
  });

  describe('setSession', () => {
    it('stores session in localStorage', () => {
      setSession(mockSession);
      const stored = JSON.parse(localStorage.getItem('nearu_session')!);
      expect(stored.participant.id).toBe('p1');
      expect(stored.event.id).toBe('e1');
    });
  });

  describe('clearSession', () => {
    it('removes session from localStorage', () => {
      setSession(mockSession);
      clearSession();
      expect(localStorage.getItem('nearu_session')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('returns false when no session', () => {
      expect(isLoggedIn()).toBe(false);
    });

    it('returns true when session exists', () => {
      setSession(mockSession);
      expect(isLoggedIn()).toBe(true);
    });
  });
});
