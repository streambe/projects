import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn().mockReturnValue(false),
  },
}));

// We need to reset module state between tests because _permissionGranted is module-level
let requestPermission: typeof import('@/lib/notifications').requestPermission;
let hasPermission: typeof import('@/lib/notifications').hasPermission;
let sendLocalNotification: typeof import('@/lib/notifications').sendLocalNotification;

describe('notifications (web)', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    // Re-mock Capacitor for fresh module
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: vi.fn().mockReturnValue(false),
      },
    }));

    // Default: Notification API exists with 'default' permission
    Object.defineProperty(globalThis, 'Notification', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
    (globalThis.Notification as unknown as Record<string, unknown>).permission = 'default';
    (globalThis.Notification as unknown as Record<string, unknown>).requestPermission = vi.fn().mockResolvedValue('granted');

    const mod = await import('@/lib/notifications');
    requestPermission = mod.requestPermission;
    hasPermission = mod.hasPermission;
    sendLocalNotification = mod.sendLocalNotification;
  });

  describe('hasPermission', () => {
    it('returns true when Notification.permission is granted', () => {
      (globalThis.Notification as unknown as Record<string, unknown>).permission = 'granted';
      expect(hasPermission()).toBe(true);
    });

    it('returns false when Notification.permission is denied', () => {
      (globalThis.Notification as unknown as Record<string, unknown>).permission = 'denied';
      expect(hasPermission()).toBe(false);
    });

    it('returns false when Notification API is undefined', () => {
      Object.defineProperty(globalThis, 'Notification', { value: undefined, writable: true, configurable: true });
      expect(hasPermission()).toBe(false);
    });
  });

  describe('requestPermission', () => {
    it('calls Notification.requestPermission and returns true on granted', async () => {
      const result = await requestPermission();
      expect(result).toBe(true);
      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    it('returns true immediately if already granted', async () => {
      (globalThis.Notification as unknown as Record<string, unknown>).permission = 'granted';
      const result = await requestPermission();
      expect(result).toBe(true);
    });

    it('returns false if permission is denied', async () => {
      (globalThis.Notification as unknown as Record<string, unknown>).permission = 'denied';
      const result = await requestPermission();
      expect(result).toBe(false);
    });
  });

  describe('sendLocalNotification', () => {
    it('creates Notification when permission granted', async () => {
      (globalThis.Notification as unknown as Record<string, unknown>).permission = 'granted';
      await sendLocalNotification('Hello', 'World');
      expect(globalThis.Notification).toHaveBeenCalledWith('Hello', expect.objectContaining({ body: 'World' }));
    });

    it('does nothing when no permission', async () => {
      (globalThis.Notification as unknown as Record<string, unknown>).permission = 'denied';
      await sendLocalNotification('Hello', 'World');
      // Notification constructor should not be called (only the mock setup call exists)
      // The function returns early due to !hasPermission()
      expect((globalThis.Notification as unknown as vi.Mock).mock.calls.filter(
        (c: unknown[]) => c[0] === 'Hello'
      )).toHaveLength(0);
    });
  });
});
