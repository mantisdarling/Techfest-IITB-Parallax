// [x, z, width, depth] of each maze barrier wall
export const MAZE_WALLS: ReadonlyArray<readonly [number, number, number, number]> = [
  [-90, 0, 10, 80],
  [90, 0, 10, 80],
  [0, -60, 120, 10],
  [0, 60, 120, 10],
  [-40, -20, 10, 60],
  [40, 20, 10, 60],
  [0, 0, 50, 10],
];

export const GOAL_POSITION = { x: 70, z: -70 } as const;
export const GOAL_CAPTURE_RADIUS = 22;
export const BOT_START = { x: -60, z: 60 } as const;
export const BOT_SPEED = 120;

export function distanceToGoal(x: number, z: number): number {
  return Math.hypot(x - GOAL_POSITION.x, z - GOAL_POSITION.z);
}

export function isGoalReached(x: number, z: number): boolean {
  return distanceToGoal(x, z) < GOAL_CAPTURE_RADIUS;
}
