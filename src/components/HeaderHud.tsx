import { ChevronRight, MapPin, Volume2, VolumeX } from 'lucide-react';
import { REALM_DATA } from '../data/realms';
import type { CameraMode } from '../types';
import MobileNav from './MobileNav';

interface Props {
  activeRealmIndex: number;
  cameraMode: CameraMode;
  soundEnabled: boolean;
  onWarp: (index: number) => void;
  onCameraModeChange: (mode: CameraMode) => void;
  onToggleSound: () => void;
  onOpenMap: () => void;
  onOpenPass: () => void;
}

const CAMERA_MODES: Array<{ mode: CameraMode; label: string; title: string }> = [
  { mode: 'scroll', label: 'SCROLL 3D', title: 'Scroll Camera' },
  { mode: 'cockpit', label: 'COCKPIT', title: 'First Person Mecha Cockpit' },
  { mode: 'fpv', label: 'FPV DRONE', title: 'FPV Free Flight Drone' },
  { mode: 'orbit', label: '360° ORBIT', title: '360 Orbit View' },
];

export default function HeaderHud({
  activeRealmIndex,
  cameraMode,
  soundEnabled,
  onWarp,
  onCameraModeChange,
  onToggleSound,
  onOpenMap,
  onOpenPass,
}: Props) {
  return (
    <header className="manga-hud-header">
      <div className="hud-brand">
        <div className="hud-logo-box">TF</div>
        <div className="hud-brand-title">
          <span className="brand-main">TECHFEST 2026</span>
          <span className="brand-sub">IIT BOMBAY // アジア最大の技術祭</span>
        </div>
      </div>

      <nav className="hud-chapters">
        {REALM_DATA.map((r, i) => (
          <button
            key={r.id}
            type="button"
            className={`chapter-pill ${activeRealmIndex === i ? 'active' : ''}`}
            onClick={() => onWarp(i)}
          >
            {r.num} // {r.kanji}
          </button>
        ))}
      </nav>

      <div className="camera-mode-group">
        {CAMERA_MODES.map(({ mode, label, title }) => (
          <button
            key={mode}
            type="button"
            className={`cam-btn ${cameraMode === mode ? 'active' : ''}`}
            onClick={() => onCameraModeChange(mode)}
            title={title}
          >
            {label}
          </button>
        ))}
      </div>

      <MobileNav
        activeRealmIndex={activeRealmIndex}
        cameraMode={cameraMode}
        onWarp={onWarp}
        onCameraModeChange={onCameraModeChange}
      />

      <div className="hud-controls">
        <button
          type="button"
          className="control-icon-btn"
          onClick={onOpenMap}
          title="View 3D Campus Venues"
          aria-label="Open campus venue map"
        >
          <MapPin size={14} />
          <span>MAP</span>
        </button>

        <button
          type="button"
          className="control-icon-btn"
          onClick={onToggleSound}
          title="Toggle Procedural Cyber Audio"
          aria-label="Toggle sound effects"
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>SFX</span>
        </button>

        <button type="button" className="manga-btn hud-pass-btn" onClick={onOpenPass}>
          <span>GET PASS</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </header>
  );
}
