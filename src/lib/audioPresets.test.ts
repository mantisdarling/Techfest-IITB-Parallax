import { describe, expect, it } from 'vitest';
import { DJ_BEAT_SEQUENCE, DJ_STEP_MS, SFX_PRESETS } from './audioPresets';
import type { SfxType } from '../types';

const ALL_TYPES: SfxType[] = ['kick', 'hihat', 'synth', 'drop', 'warp', 'click'];

describe('sfx presets', () => {
  it('defines a valid preset for every sfx type', () => {
    for (const type of ALL_TYPES) {
      const p = SFX_PRESETS[type];
      expect(p.freqStart).toBeGreaterThan(0);
      expect(p.gain).toBeGreaterThan(0);
      expect(p.gain).toBeLessThanOrEqual(1);
      expect(p.duration).toBeGreaterThan(0);
      if (p.freqEnd !== null) expect(p.freqEnd).toBeGreaterThan(0);
    }
  });

  it('hihat has no pitch ramp', () => {
    expect(SFX_PRESETS.hihat.freqEnd).toBeNull();
  });
});

describe('dj beat sequence', () => {
  it('is an 8-step loop of known pads', () => {
    expect(DJ_BEAT_SEQUENCE).toHaveLength(8);
    for (const step of DJ_BEAT_SEQUENCE) expect(ALL_TYPES).toContain(step);
    expect(DJ_STEP_MS).toBe(250);
  });
});
