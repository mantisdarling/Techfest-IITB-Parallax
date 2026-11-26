export interface RenderQuality {
  pixelRatio: number;
  antialias: boolean;
  starCount: number;
  maxFps: number;
}

export interface DeviceProfile {
  devicePixelRatio: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  coarsePointer: boolean;
}

export const DEFAULT_RENDER_QUALITY: RenderQuality = {
  pixelRatio: 1.5,
  antialias: true,
  starCount: 1400,
  maxFps: 60,
};

export function resolveRenderQuality(profile: DeviceProfile): RenderQuality {
  const constrained =
    (profile.deviceMemory !== undefined && profile.deviceMemory <= 4) ||
    (profile.hardwareConcurrency !== undefined && profile.hardwareConcurrency <= 4);
  const lowPower = profile.coarsePointer && constrained;

  return {
    pixelRatio: Math.min(profile.devicePixelRatio || 1, lowPower ? 1.25 : 1.5),
    antialias: !lowPower,
    starCount: lowPower ? 700 : DEFAULT_RENDER_QUALITY.starCount,
    maxFps: lowPower ? 30 : DEFAULT_RENDER_QUALITY.maxFps,
  };
}
