import { describe, expect, it } from 'vitest';
import { isSteeringKey, keyToDirection } from './keyboard';

describe('keyToDirection', () => {
  it('maps WASD and arrows to unit directions', () => {
    expect(keyToDirection('w')).toEqual({ dx: 0, dz: -1 });
    expect(keyToDirection('W')).toEqual({ dx: 0, dz: -1 });
    expect(keyToDirection('ArrowUp')).toEqual({ dx: 0, dz: -1 });
    expect(keyToDirection('s')).toEqual({ dx: 0, dz: 1 });
    expect(keyToDirection('ArrowDown')).toEqual({ dx: 0, dz: 1 });
    expect(keyToDirection('a')).toEqual({ dx: -1, dz: 0 });
    expect(keyToDirection('ArrowLeft')).toEqual({ dx: -1, dz: 0 });
    expect(keyToDirection('d')).toEqual({ dx: 1, dz: 0 });
    expect(keyToDirection('ArrowRight')).toEqual({ dx: 1, dz: 0 });
  });

  it('ignores non-steering keys', () => {
    expect(keyToDirection('x')).toBeNull();
    expect(keyToDirection('Enter')).toBeNull();
    expect(isSteeringKey('q')).toBe(false);
    expect(isSteeringKey('ArrowUp')).toBe(true);
  });
});
