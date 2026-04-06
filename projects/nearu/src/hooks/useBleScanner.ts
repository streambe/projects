import { useCallback, useEffect, useRef, useState } from 'react';
import { BleBeacon } from '@/plugins/ble';
import type { BeaconDetection } from '@/plugins/ble';
import { estimateDistance } from '@/lib/ble-utils';
import type { PluginListenerHandle } from '@capacitor/core';

/** How long before a beacon is considered "gone" (walked away). */
const BEACON_TIMEOUT_MS = 30_000;

/** Cleanup interval for stale beacons. */
const CLEANUP_INTERVAL_MS = 5_000;

export interface UseBleScanner {
  /** Currently visible beacons, deduplicated by minorId. */
  nearbyBeacons: BeaconDetection[];
  /** Whether scanning is active. */
  isScanning: boolean;
  /** Last error message, or null. */
  error: string | null;
  /** Start scanning for beacons matching this event UUID. */
  startScanning: (eventUuid: string) => Promise<void>;
  /** Stop scanning. */
  stopScanning: () => Promise<void>;
}

/**
 * React hook wrapping the BleBeacon Capacitor plugin.
 *
 * - Deduplicates beacons by minorId (keeps latest RSSI/distance)
 * - Removes beacons not seen in the last 30 seconds
 * - Recalculates estimated distance from RSSI
 */
export function useBleScanner(): UseBleScanner {
  const [beaconMap, setBeaconMap] = useState<Map<number, BeaconDetection>>(
    new Map(),
  );
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenersRef = useRef<PluginListenerHandle[]>([]);
  const cleanupRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup stale beacons periodically
  useEffect(() => {
    if (!isScanning) return;

    cleanupRef.current = setInterval(() => {
      const now = Date.now();
      setBeaconMap((prev) => {
        const next = new Map(prev);
        let changed = false;
        for (const [minorId, detection] of next) {
          if (now - detection.timestamp > BEACON_TIMEOUT_MS) {
            next.delete(minorId);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, CLEANUP_INTERVAL_MS);

    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
        cleanupRef.current = null;
      }
    };
  }, [isScanning]);

  const startScanning = useCallback(async (eventUuid: string) => {
    try {
      setError(null);
      setBeaconMap(new Map());

      const detectionHandle = await BleBeacon.addListener(
        'beaconDetected',
        (data: BeaconDetection) => {
          // Recalculate distance in case native didn't provide it
          const detection: BeaconDetection = {
            ...data,
            estimatedDistance: data.estimatedDistance || estimateDistance(data.rssi),
            timestamp: data.timestamp || Date.now(),
          };

          setBeaconMap((prev) => {
            const next = new Map(prev);
            next.set(detection.minorId, detection);
            return next;
          });
        },
      );

      const errorHandle = await BleBeacon.addListener(
        'scanError',
        (data: { message: string }) => {
          setError(data.message);
        },
      );

      listenersRef.current = [detectionHandle, errorHandle];

      await BleBeacon.startScanning({ eventUuid });
      setIsScanning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scanning');
    }
  }, []);

  const stopScanning = useCallback(async () => {
    try {
      await BleBeacon.stopScanning();
      for (const handle of listenersRef.current) {
        await handle.remove();
      }
      listenersRef.current = [];
      setIsScanning(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop scanning');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isScanning) {
        BleBeacon.stopScanning().catch(() => {});
        BleBeacon.removeAllListeners().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    nearbyBeacons: Array.from(beaconMap.values()),
    isScanning,
    error,
    startScanning,
    stopScanning,
  };
}
