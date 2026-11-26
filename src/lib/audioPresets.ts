import type { SfxType } from '../types';

export interface SfxPreset {
  wave: OscillatorType;
  freqStart: number;
  freqEnd: number | null;
  gain: number;
  duration: number;
}

export const SFX_PRESETS: Record<SfxType, SfxPreset> = {
  kick: { wave: 'sine', freqStart: 140, freqEnd: 30, gain: 0.3, duration: 0.12 },
  hihat: { wave: 'square', freqStart: 2200, freqEnd: null, gain: 0.05, duration: 0.04 },
  synth: { wave: 'sawtooth', freqStart: 587.33, freqEnd: 880, gain: 0.12, duration: 0.18 },
  drop: { wave: 'triangle', freqStart: 320, freqEnd: 45, gain: 0.25, duration: 0.4 },
  warp: { wave: 'sawtooth', freqStart: 300, freqEnd: 1400, gain: 0.08, duration: 0.25 },
  click: { wave: 'square', freqStart: 800, freqEnd: 1200, gain: 0.04, duration: 0.04 },
};

export const DJ_BEAT_SEQUENCE: SfxType[] = [
  'kick',
  'hihat',
  'synth',
  'hihat',
  'kick',
  'hihat',
  'drop',
  'hihat',
];

export const DJ_STEP_MS = 250;
export const DJ_BEAT_PULSE_MS = 140;
