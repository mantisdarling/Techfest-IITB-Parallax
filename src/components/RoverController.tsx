import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Crosshair } from 'lucide-react';
import type { BotControl } from '../types';

interface Props {
  goalAchieved: boolean;
  onSteer: (control: BotControl) => void;
  onRelease: () => void;
}

const DPAD_DIRECTIONS = [
  { key: 'up', x: 0, z: -1, Icon: ArrowUp, label: 'Steer rover forward' },
  { key: 'left', x: -1, z: 0, Icon: ArrowLeft, label: 'Steer rover left' },
  { key: 'right', x: 1, z: 0, Icon: ArrowRight, label: 'Steer rover right' },
  { key: 'down', x: 0, z: 1, Icon: ArrowDown, label: 'Steer rover backward' },
] as const;

export default function RoverController({ goalAchieved, onSteer, onRelease }: Props) {
  return (
    <div className="rover-controller-box">
      <div>
        <div className="rover-title">🎮 PLAYABLE 30nm ROVER</div>
        <div className="rover-hint">USE WASD / KEYS OR DPAD TO STEER</div>
        {goalAchieved && <div className="rover-goal">★ CHECKPOINT CAPTURED!</div>}
      </div>

      <div className="dpad-container">
        <div />
        <DpadButton dir={DPAD_DIRECTIONS[0]} onSteer={onSteer} onRelease={onRelease} />
        <div />
        <DpadButton dir={DPAD_DIRECTIONS[1]} onSteer={onSteer} onRelease={onRelease} />
        <div className="dpad-center">
          <Crosshair size={12} />
        </div>
        <DpadButton dir={DPAD_DIRECTIONS[2]} onSteer={onSteer} onRelease={onRelease} />
        <div />
        <DpadButton dir={DPAD_DIRECTIONS[3]} onSteer={onSteer} onRelease={onRelease} />
        <div />
      </div>
    </div>
  );
}

function DpadButton({
  dir,
  onSteer,
  onRelease,
}: {
  dir: (typeof DPAD_DIRECTIONS)[number];
  onSteer: (control: BotControl) => void;
  onRelease: () => void;
}) {
  const { Icon, label, x, z } = dir;
  return (
    <button
      type="button"
      className="dpad-btn"
      aria-label={label}
      onMouseDown={() => onSteer({ x, z, active: true })}
      onMouseUp={onRelease}
      onTouchStart={() => onSteer({ x, z, active: true })}
      onTouchEnd={onRelease}
    >
      <Icon size={16} />
    </button>
  );
}
