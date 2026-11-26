import { describe, expect, it } from 'vitest';
import {
  BOT_START,
  GOAL_CAPTURE_RADIUS,
  GOAL_POSITION,
  MAZE_WALLS,
  distanceToGoal,
  isGoalReached,
} from './maze';

describe('maze geometry', () => {
  it('defines seven barrier walls with positive dimensions', () => {
    expect(MAZE_WALLS).toHaveLength(7);
    for (const [, , w, d] of MAZE_WALLS) {
      expect(w).toBeGreaterThan(0);
      expect(d).toBeGreaterThan(0);
    }
  });

  it('detects goal capture inside the radius', () => {
    expect(isGoalReached(GOAL_POSITION.x, GOAL_POSITION.z)).toBe(true);
    expect(isGoalReached(GOAL_POSITION.x + GOAL_CAPTURE_RADIUS - 1, GOAL_POSITION.z)).toBe(true);
  });

  it('does not capture at or beyond the radius', () => {
    expect(isGoalReached(GOAL_POSITION.x + GOAL_CAPTURE_RADIUS, GOAL_POSITION.z)).toBe(false);
    expect(isGoalReached(BOT_START.x, BOT_START.z)).toBe(false);
  });

  it('computes euclidean distance to the goal', () => {
    expect(distanceToGoal(GOAL_POSITION.x + 3, GOAL_POSITION.z + 4)).toBeCloseTo(5, 10);
  });
});
