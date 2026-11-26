import { describe, expect, it } from 'vitest';
import { depthReadout, realmVisibility, scrollCameraTarget } from './cameraPath';

describe('scroll camera path', () => {
  it('starts at Z +400 and ends at Z -1800', () => {
    expect(scrollCameraTarget(0).z).toBe(400);
    expect(scrollCameraTarget(1).z).toBe(-1800);
    expect(scrollCameraTarget(0.5).z).toBe(-700);
  });

  it('produces finite sway coordinates', () => {
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      const t = scrollCameraTarget(p);
      expect(Number.isFinite(t.x)).toBe(true);
      expect(Number.isFinite(t.y)).toBe(true);
      expect(Math.abs(t.x)).toBeLessThanOrEqual(60);
      expect(Math.abs(t.y)).toBeLessThanOrEqual(30);
    }
  });
});

describe('realm visibility', () => {
  it('shows only the gateway near the start', () => {
    const v = realmVisibility(300);
    expect(v).toEqual({ realm1: true, realm2: false, realm3: false, realm4: false });
  });

  it('shows the arena in its Z window', () => {
    const v = realmVisibility(-500);
    expect(v.realm2).toBe(true);
    expect(v.realm1).toBe(false);
    expect(v.realm4).toBe(false);
  });

  it('shows the stage deep in the journey', () => {
    const v = realmVisibility(-1800);
    expect(v.realm4).toBe(true);
    expect(v.realm1).toBe(false);
    expect(v.realm2).toBe(false);
  });
});

describe('depth readout', () => {
  it('matches the camera Z rounded to meters', () => {
    expect(depthReadout(0)).toBe(400);
    expect(depthReadout(1)).toBe(-1800);
    expect(depthReadout(0.333)).toBe(Math.round(400 - 0.333 * 2200));
  });
});
