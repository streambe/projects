import type { PluginListenerHandle } from '@capacitor/core';

/**
 * BLE Beacon Plugin — Capacitor plugin interface for scanning iBeacon devices.
 *
 * Native implementations (iOS/Android) use platform BLE APIs to scan for
 * iBeacon advertisements. The web implementation provides a mock for development.
 *
 * iBeacon format used by FeasyBeacon FSC-BP107D:
 *   - UUID: identifies the event
 *   - Major: reserved (always 1)
 *   - Minor: identifies the individual wristband
 */
export interface BleBeaconPlugin {
  /**
   * Start scanning for iBeacon advertisements matching the given event UUID.
   * Only beacons with this UUID will be reported.
   */
  startScanning(options: { eventUuid: string }): Promise<void>;

  /** Stop scanning for beacons. */
  stopScanning(): Promise<void>;

  /** Listen for beacon detection events. */
  addListener(
    eventName: 'beaconDetected',
    handler: (data: BeaconDetection) => void,
  ): Promise<PluginListenerHandle>;

  /** Listen for scan errors. */
  addListener(
    eventName: 'scanError',
    handler: (data: ScanError) => void,
  ): Promise<PluginListenerHandle>;

  /** Remove all listeners registered by this plugin. */
  removeAllListeners(): Promise<void>;
}

/** A single beacon detection event. */
export interface BeaconDetection {
  /** Minor ID from the iBeacon advertisement — identifies the wristband. */
  minorId: number;
  /** Received Signal Strength Indicator in dBm. Typical range: -30 to -100. */
  rssi: number;
  /** Estimated distance in meters, calculated from RSSI. */
  estimatedDistance: number;
  /** Unix timestamp in milliseconds when this detection occurred. */
  timestamp: number;
}

export interface ScanError {
  message: string;
}
