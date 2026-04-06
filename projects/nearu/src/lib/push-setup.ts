/**
 * Push notification setup.
 * - Web: uses Notification API (local only for MVP)
 * - Native: uses @capacitor/push-notifications for FCM/APNs token
 */

import { Capacitor } from '@capacitor/core';
import { registerDeviceToken, removeDeviceToken } from '@/lib/api/device-tokens';

const TOKEN_STORAGE_KEY = 'nearu_push_token';

/**
 * Initialize push notifications and register the device token.
 * Call this after login.
 */
export async function initPushNotifications(
  participantId: string,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // Web: no FCM token needed for MVP (local notifications only)
    return;
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', async ({ value: token }) => {
      const platform = Capacitor.getPlatform() as 'ios' | 'android';
      await registerDeviceToken(participantId, token, platform);
      // Store token locally so we can remove it on logout
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration failed:', error);
    });
  } catch {
    // Plugin not available
  }
}

/**
 * Clean up push token on logout.
 */
export async function cleanupPushNotifications(): Promise<void> {
  if (typeof localStorage === 'undefined') return;

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    await removeDeviceToken(token).catch(() => {});
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}
