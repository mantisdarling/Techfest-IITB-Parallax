import { describe, expect, it } from 'vitest';
import { resolveRenderQuality } from './quality';

describe('resolveRenderQuality', () => {
  it('caps high density phone rendering on constrained devices', () => {
    expect(
      resolveRenderQuality({
        devicePixelRatio: 3,
        deviceMemory: 4,
        hardwareConcurrency: 4,
        coarsePointer: true,
      })
    ).toEqual({ pixelRatio: 1.25, antialias: false, starCount: 700, maxFps: 30 });
  });

  it('preserves full quality on capable desktop hardware', () => {
    expect(
      resolveRenderQuality({
        devicePixelRatio: 2,
        deviceMemory: 16,
        hardwareConcurrency: 12,
        coarsePointer: false,
      })
    ).toEqual({ pixelRatio: 1.5, antialias: true, starCount: 1400, maxFps: 60 });
  });
});
