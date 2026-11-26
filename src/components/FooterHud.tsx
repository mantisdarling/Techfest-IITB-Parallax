import { Terminal } from 'lucide-react';
import { REALM_DATA } from '../data/realms';
import { depthReadout } from '../three/cameraPath';
import type { CameraMode } from '../types';

interface Props {
  cameraMode: CameraMode;
  activeRealmIndex: number;
  scrollProgress: number;
}

export default function FooterHud({ cameraMode, activeRealmIndex, scrollProgress }: Props) {
  return (
    <footer className="manga-hud-footer">
      <div className="hud-hint">
        <Terminal size={14} />
        <span>DRAG 3D TO ROTATE // WASD TO DRIVE ROVER // SCROLL TO WARP</span>
      </div>

      <div className="hud-telemetry-box">
        <div className="telemetry-item">
          <span className="lbl">MODE:</span>
          <span className="val">{cameraMode.toUpperCase()}</span>
        </div>
        <div className="telemetry-item">
          <span className="lbl">REALM:</span>
          <span className="val">{REALM_DATA[activeRealmIndex].num} / 04</span>
        </div>
        <div className="telemetry-item">
          <span className="lbl">DEPTH:</span>
          <span className="val">Z: {depthReadout(scrollProgress)}m</span>
        </div>
      </div>
    </footer>
  );
}
