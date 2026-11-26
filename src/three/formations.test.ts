import { describe, expect, it } from 'vitest';
import {
  DRONE_COUNT,
  buildMorphTargets,
  falconPositions,
  helixPositions,
  spherePositions,
  tfPositions,
} from './formations';

function expectFiniteVec3(arr: Float32Array, count: number) {
  expect(arr.length).toBe(count * 3);
  for (const v of arr) expect(Number.isFinite(v)).toBe(true);
}

describe('drone formations', () => {
  it('sphere points sit on a radius-95 shell', () => {
    const pos = spherePositions(DRONE_COUNT);
    expectFiniteVec3(pos, DRONE_COUNT);
    for (let i = 0; i < DRONE_COUNT; i++) {
      const r = Math.hypot(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      expect(r).toBeCloseTo(95, 3);
    }
  });

  it('tf formation is deterministic for a fixed rng and bounded', () => {
    const rng = () => 0.5;
    const a = tfPositions(DRONE_COUNT, rng);
    const b = tfPositions(DRONE_COUNT, rng);
    expect(Array.from(a)).toEqual(Array.from(b));
    expectFiniteVec3(a, DRONE_COUNT);
    for (let i = 0; i < DRONE_COUNT; i++) {
      expect(a[i * 3 + 2]).toBe(0); // (0.5 - 0.5) * 10
      expect(a[i * 3 + 1]).toBeGreaterThanOrEqual(-60);
      expect(a[i * 3 + 1]).toBeLessThanOrEqual(60);
    }
  });

  it('falcon wings alternate sides with growing span', () => {
    const pos = falconPositions(DRONE_COUNT);
    expectFiniteVec3(pos, DRONE_COUNT);
    for (let i = 0; i < DRONE_COUNT; i++) {
      const x = pos[i * 3];
      if (i % 2 === 0) expect(x).toBeGreaterThanOrEqual(0);
      else expect(x).toBeLessThanOrEqual(0);
      if (i >= 2) expect(Math.abs(x)).toBeGreaterThan(Math.abs(pos[(i - 2) * 3]));
    }
  });

  it('helix strands stay on a radius-65 cylinder', () => {
    const pos = helixPositions(DRONE_COUNT);
    expectFiniteVec3(pos, DRONE_COUNT);
    for (let i = 0; i < DRONE_COUNT; i++) {
      const r = Math.hypot(pos[i * 3], pos[i * 3 + 2]);
      expect(r).toBeCloseTo(65, 3);
      expect(Math.abs(pos[i * 3 + 1])).toBeLessThanOrEqual(90);
    }
  });

  it('buildMorphTargets provides all four formations', () => {
    const targets = buildMorphTargets(16, () => 0.5);
    expect(Object.keys(targets).sort()).toEqual(['falcon', 'helix', 'sphere', 'tf']);
    for (const arr of Object.values(targets)) expectFiniteVec3(arr, 16);
  });
});
