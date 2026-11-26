import { useEffect } from 'react';

interface Props {
  botActive: boolean;
  goalAchieved: boolean;
  onExit: () => void;
}

export default function CockpitHud({ botActive, goalAchieved, onExit }: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  return (
    <div className="cockpit-hud-overlay">
      <div className="cockpit-hud-row">
        <div className="cockpit-telemetry-left">
          [MECHA RADAR LOCK // 30nm GRID]
          <br />
          SPEED: {botActive ? '3.8 M/S' : '1.2 M/S'}
          <br />
          STATUS: {goalAchieved ? 'GOAL ACHIEVED!' : 'HUNTING CHECKPOINT'}
        </div>
        <div className="cockpit-telemetry-right">
          PITCH: 0.00° // ROLL: 0.00°
          <br />
          LiDAR: 360° ACTIVE
          <br />
          IITB COMBAT DIVISION
        </div>
      </div>

      <div className="cockpit-reticle-center">
        <span className="cockpit-reticle-label">TARGET LOCK</span>
      </div>

      <div className="cockpit-exit-row">
        <button type="button" className="manga-btn" onClick={onExit}>
          EXIT COCKPIT VIEW [ESC]
        </button>
      </div>
    </div>
  );
}
