/**
 * Local notification utilities.
 * Uses the browser Notification API on web, Capacitor LocalNotifications on native.
 */

import { Capacitor } from '@capacitor/core';

let _permissionGranted = false;

/**
 * Request notification permission from the user.
 * Returns true if permission was granted.
 */
export async function requestPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import(
        '@capacitor/local-notifications'
      );
      const result = await LocalNotifications.requestPermissions();
      _permissionGranted = result.display === 'granted';
      return _permissionGranted;
    } catch {
      // LocalNotifications plugin not available
      return false;
    }
  }

  // Web fallback
  if (typeof Notification === 'undefined') return false;

  if (Notification.permission === 'granted') {
    _permissionGranted = true;
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const result = await Notification.requestPermission();
  _permissionGranted = result === 'granted';
  return _permissionGranted;
}

/**
 * Check if notification permission has been granted.
 */
export function hasPermission(): boolean {
  if (Capacitor.isNativePlatform()) {
    return _permissionGranted;
  }
  if (typeof Notification === 'undefined') return false;
  return Notification.permission === 'granted';
}

/**
 * Send a local notification immediately.
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  if (!hasPermission()) return;

  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import(
        '@capacitor/local-notifications'
      );
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            extra: data,
          },
        ],
      });
    } catch {
      // Plugin not available
    }
    return;
  }

  // Web fallback
  if (typeof Notification !== 'undefined') {
    new Notification(title, { body, data });
  }
}
