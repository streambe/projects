import { WebPlugin } from '@capacitor/core';
import type { BleBeaconPlugin, BeaconDetection } from './definitions';
import { estimateDistance } from '@/lib/ble-utils';

/**
 * Web mock implementation of BleBeaconPlugin.
 *
 * Generates fake beacon detections every 5 seconds for development/testing
 * without real BLE hardware. Simulates 3-8 wristbands at varying distances.
 */
export class BleBeaconWeb extends WebPlugin implements BleBeaconPlugin {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private mockMinorIds: number[] = [];

  async startScanning(options: { eventUuid: string }): Promise<void> {
    console.log(
      `[BleBeaconWeb] Mock scanning started for UUID: ${options.eventUuid}`,
    );

    // Generate a set of mock wristband minor IDs (3-8 people nearby)
    const count = 3 + Math.floor(Math.random() * 6);
    this.mockMinorIds = Array.from({ length: count }, () =>
      Math.floor(Math.random() * 65535),
    );

    this.intervalId = setInterval(() => {
      // Each tick, report a random subset of the mock beacons
      const reportCount = 1 + Math.floor(Math.random() * this.mockMinorIds.length);
      const shuffled = [...this.mockMinorIds].sort(() => Math.random() - 0.5);

      for (let i = 0; i < reportCount; i++) {
        // Simulate RSSI between -40 (very close) and -90 (far)
        const rssi = -40 - Math.floor(Math.random() * 50);
        const detection: BeaconDetection = {
          minorId: shuffled[i],
          rssi,
          estimatedDistance: estimateDistance(rssi),
          timestamp: Date.now(),
        };

        this.notifyListeners('beaconDetected', detection);
      }
    }, 5000);
  }

  async stopScanning(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.mockMinorIds = [];
    console.log('[BleBeaconWeb] Mock scanning stopped');
  }
}
