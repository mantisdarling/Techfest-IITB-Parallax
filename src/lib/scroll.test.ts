import { describe, expect, it } from 'vitest';
import { computeScrollProgress, realmIndexFromProgress } from './scroll';

describe('computeScrollProgress', () => {
  it('maps scroll position to 0..1', () => {
    expect(computeScrollProgress(0, 5000, 1000)).toBe(0);
    expect(computeScrollProgress(2000, 5000, 1000)).toBe(0.5);
    expect(computeScrollProgress(4000, 5000, 1000)).toBe(1);
  });

  it('clamps out-of-range scroll', () => {
    expect(computeScrollProgress(-100, 5000, 1000)).toBe(0);
    expect(computeScrollProgress(99999, 5000, 1000)).toBe(1);
  });

  it('returns 0 when the page does not scroll', () => {
    expect(computeScrollProgress(0, 1000, 1000)).toBe(0);
    expect(computeScrollProgress(50, 800, 1000)).toBe(0);
  });
});

describe('realmIndexFromProgress', () => {
  it('splits the journey into four realms', () => {
    expect(realmIndexFromProgress(0)).toBe(0);
    expect(realmIndexFromProgress(0.24)).toBe(0);
    expect(realmIndexFromProgress(0.25)).toBe(1);
    expect(realmIndexFromProgress(0.5)).toBe(2);
    expect(realmIndexFromProgress(0.75)).toBe(3);
    expect(realmIndexFromProgress(1)).toBe(3);
  });
});
