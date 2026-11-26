import { useEffect, useState } from 'react';
import { isSteeringKey, keyToDirection } from '../lib/keyboard';
import type { BotControl, PlaySfx } from '../types';

const IDLE_CONTROL: BotControl = { x: 0, z: 0, active: false };

export function useRoverControls(activeRealmIndex: number, playSfx: PlaySfx) {
  const [botControl, setBotControl] = useState<BotControl>(IDLE_CONTROL);
  const [botGoalAchieved, setBotGoalAchieved] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeRealmIndex !== 1 || e.repeat) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }
      const dir = keyToDirection(e.key);
      if (dir) {
        e.preventDefault();
        setBotControl({ x: dir.dx, z: dir.dz, active: true });
        playSfx('click');
      }
    };

    const releaseControls = () => setBotControl(IDLE_CONTROL);
    const handleKeyUp = (e: KeyboardEvent) => {
      if (isSteeringKey(e.key)) releaseControls();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) releaseControls();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', releaseControls);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', releaseControls);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeRealmIndex, playSfx]);

  return {
    botControl: activeRealmIndex === 1 ? botControl : IDLE_CONTROL,
    setBotControl,
    botGoalAchieved,
    setBotGoalAchieved,
  };
}
