import type { DroneFormation } from '../types';

export const DRONE_COUNT = 480;

export function spherePositions(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    const r = 95;
    out[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    out[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    out[i * 3 + 2] = r * Math.cos(phi);
  }
  return out;
}

export function tfPositions(count: number, random: () => number = Math.random): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    if (t < 0.5) {
      const sub = t / 0.5;
      if (sub < 0.4) {
        out[i * 3] = (sub / 0.4 - 0.5) * 120 - 40;
        out[i * 3 + 1] = 60;
      } else {
        out[i * 3] = -40;
        out[i * 3 + 1] = 60 - ((sub - 0.4) / 0.6) * 120;
      }
    } else {
      const sub = (t - 0.5) / 0.5;
      if (sub < 0.4) {
        out[i * 3] = (sub / 0.4) * 60 + 20;
        out[i * 3 + 1] = 60;
      } else if (sub < 0.7) {
        out[i * 3] = 20;
        out[i * 3 + 1] = 60 - ((sub - 0.4) / 0.3) * 120;
      } else {
        out[i * 3] = ((sub - 0.7) / 0.3) * 45 + 20;
        out[i * 3 + 1] = 10;
      }
    }
    out[i * 3 + 2] = (random() - 0.5) * 10;
  }
  return out;
}

export function falconPositions(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const progress = i / count;
    const span = progress * 140;
    out[i * 3] = side * span;
    out[i * 3 + 1] = Math.sin(progress * Math.PI) * 50 - progress * 40;
    out[i * 3 + 2] = -progress * 70;
  }
  return out;
}

export function helixPositions(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 8;
    const strand = i % 2 === 0 ? 0 : Math.PI;
    out[i * 3] = Math.cos(angle + strand) * 65;
    out[i * 3 + 1] = (i / count - 0.5) * 180;
    out[i * 3 + 2] = Math.sin(angle + strand) * 65;
  }
  return out;
}

export function buildMorphTargets(
  count: number,
  random: () => number = Math.random
): Record<DroneFormation, Float32Array> {
  return {
    sphere: spherePositions(count),
    tf: tfPositions(count, random),
    falcon: falconPositions(count),
    helix: helixPositions(count),
  };
}
