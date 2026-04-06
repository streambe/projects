/**
 * BLE distance estimation utilities.
 *
 * Uses the log-distance path loss model to estimate distance from RSSI:
 *   distance = 10 ^ ((txPower - rssi) / (10 * n))
 *
 * Where:
 *   txPower = calibrated RSSI at 1 meter (default -59 dBm for FeasyBeacon)
 *   n = path loss exponent (2.0 for free space, higher for obstacles)
 */

/** Path loss exponent. 2.0 = free space, 2.5-3.0 = indoor with obstacles. */
const PATH_LOSS_EXPONENT = 2.0;

/** Default TX power (RSSI at 1 meter) for FeasyBeacon FSC-BP107D. */
const DEFAULT_TX_POWER = -59;

/** Default maximum range in meters for "nearby" detection. */
const DEFAULT_MAX_DISTANCE = 5;

/**
 * Estimate distance in meters from RSSI using log-distance path loss model.
 *
 * @param rssi - Received signal strength in dBm (negative number)
 * @param txPower - Calibrated RSSI at 1 meter distance (default: -59)
 * @returns Estimated distance in meters, clamped to [0.1, 100]
 */
export function estimateDistance(
  rssi: number,
  txPower: number = DEFAULT_TX_POWER,
): number {
  if (rssi >= 0) return 0.1; // Invalid RSSI, assume very close

  const ratio = (txPower - rssi) / (10 * PATH_LOSS_EXPONENT);
  const distance = Math.pow(10, ratio);

  // Clamp to reasonable range
  return Math.max(0.1, Math.min(100, distance));
}

/**
 * Check if a beacon is within range.
 *
 * @param distance - Distance in meters
 * @param maxDistance - Maximum range in meters (default: 5)
 */
export function isInRange(
  distance: number,
  maxDistance: number = DEFAULT_MAX_DISTANCE,
): boolean {
  return distance <= maxDistance;
}
