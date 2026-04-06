import { registerPlugin } from '@capacitor/core';
import type { BleBeaconPlugin } from './definitions';

/**
 * BleBeacon Capacitor plugin.
 *
 * On native platforms (iOS/Android), uses the platform-specific BLE implementation.
 * On web, falls back to BleBeaconWeb mock that generates fake detections.
 */
const BleBeacon = registerPlugin<BleBeaconPlugin>('BleBeacon', {
  web: () => import('./web').then((m) => new m.BleBeaconWeb()),
});

export { BleBeacon };
export type { BleBeaconPlugin, BeaconDetection, ScanError } from './definitions';
