export const CAMERA_START_Z = 400;
export const CAMERA_TRAVEL = 2200;
export const FPV_MIN_Z = -2000;
export const FPV_RESET_Z = 300;
export const FPV_SPEED = 75;
export const ORBIT_RADIUS = 500;
export const ORBIT_CENTER_Z = -700;

export interface CameraTarget {
  x: number;
  y: number;
  z: number;
}

export function scrollCameraTarget(progress: number): CameraTarget {
  return {
    x: Math.sin(progress * Math.PI * 3) * 60,
    y: Math.cos(progress * Math.PI * 2) * 30,
    z: CAMERA_START_Z - progress * CAMERA_TRAVEL,
  };
}

export interface RealmVisibility {
  realm1: boolean;
  realm2: boolean;
  realm3: boolean;
  realm4: boolean;
}

// Selective visibility eliminates inter-chapter visual bleed
export function realmVisibility(camZ: number): RealmVisibility {
  return {
    realm1: camZ > 0,
    realm2: camZ < 250 && camZ > -750,
    realm3: camZ < -450 && camZ > -1450,
    realm4: camZ < -1100,
  };
}

export function depthReadout(progress: number): number {
  return Math.round(CAMERA_START_Z - progress * CAMERA_TRAVEL);
}
