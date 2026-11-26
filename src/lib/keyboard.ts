export interface Direction {
  dx: number;
  dz: number;
}

export function keyToDirection(key: string): Direction | null {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return { dx: 0, dz: -1 };
    case 'ArrowDown':
    case 's':
    case 'S':
      return { dx: 0, dz: 1 };
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return { dx: -1, dz: 0 };
    case 'ArrowRight':
    case 'd':
    case 'D':
      return { dx: 1, dz: 0 };
    default:
      return null;
  }
}

export function isSteeringKey(key: string): boolean {
  return keyToDirection(key) !== null;
}
