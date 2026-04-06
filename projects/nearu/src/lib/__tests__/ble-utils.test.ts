import { describe, it, expect } from 'vitest';
import { estimateDistance, isInRange } from '@/lib/ble-utils';

describe('estimateDistance', () => {
  it('returns ~1m when RSSI equals TX power', () => {
    const distance = estimateDistance(-59, -59);
    expect(distance).toBeCloseTo(1.0, 1);
  });

  it('returns shorter distance for stronger signal', () => {
    const close = estimateDistance(-40);
    const far = estimateDistance(-80);
    expect(close).toBeLessThan(far);
  });

  it('returns 0.1 for invalid positive RSSI', () => {
    expect(estimateDistance(10)).toBe(0.1);
  });

  it('clamps to minimum 0.1m', () => {
    const distance = estimateDistance(-30, -59);
    expect(distance).toBeGreaterThanOrEqual(0.1);
  });

  it('clamps to maximum 100m', () => {
    const distance = estimateDistance(-120, -59);
    expect(distance).toBeLessThanOrEqual(100);
  });

  it('uses default txPower of -59 when not specified', () => {
    const withDefault = estimateDistance(-70);
    const withExplicit = estimateDistance(-70, -59);
    expect(withDefault).toBe(withExplicit);
  });
});

describe('isInRange', () => {
  it('returns true when distance is within default 5m', () => {
    expect(isInRange(3.0)).toBe(true);
  });

  it('returns false when distance exceeds default 5m', () => {
    expect(isInRange(6.0)).toBe(false);
  });

  it('returns true at exactly the boundary', () => {
    expect(isInRange(5.0)).toBe(true);
  });

  it('respects custom maxDistance', () => {
    expect(isInRange(3.0, 2.0)).toBe(false);
    expect(isInRange(1.0, 2.0)).toBe(true);
  });
});
