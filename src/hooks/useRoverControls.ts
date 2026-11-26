import { useEffect, useState } from 'react';
import { isSteeringKey, keyToDirection } from '../lib/keyboard';
import type { BotControl, PlaySfx } from '../types';

const IDLE_CONTROL: BotControl = { x: 0, z: 0, active: false };

export function useRoverControls(activeRealmIndex: number, playSfx: PlaySfx) {
  const [botControl, setBotControl] = useState<BotControl>(IDLE_CONTROL);
  const [botGoalAchieved, setBotGoalAchieved] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeRealmIndex !== 1) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }
      const dir = keyToDirection(e.key);
      if (dir) {
        setBotControl({ x: dir.dx, z: dir.dz, active: true });
        playSfx('click');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isSteeringKey(e.key)) {
        setBotControl((prev) => ({ ...prev, x: 0, z: 0 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeRealmIndex, playSfx]);

  return { botControl, setBotControl, botGoalAchieved, setBotGoalAchieved };
}
