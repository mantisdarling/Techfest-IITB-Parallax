import { useEffect, useRef, useState } from 'react';
import { REALM_DATA } from '../data/realms';
import type { CameraMode } from '../types';

const CAMERA_MODES: Array<{ mode: CameraMode; label: string }> = [
  { mode: 'scroll', label: 'SCROLL 3D' },
  { mode: 'cockpit', label: 'COCKPIT' },
  { mode: 'fpv', label: 'FPV DRONE' },
  { mode: 'orbit', label: '360° ORBIT' },
];

interface Props {
  activeRealmIndex: number;
  cameraMode: CameraMode;
  onWarp: (index: number) => void;
  onCameraModeChange: (mode: CameraMode) => void;
}

export default function MobileNav({
  activeRealmIndex,
  cameraMode,
  onWarp,
  onCameraModeChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="mobile-nav" ref={rootRef}>
      <button
        ref={toggleRef}
        type="button"
        className="mobile-nav-toggle"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-navigation-panel"
        onClick={() => setOpen((value) => !value)}
      >
        MENU
      </button>
      {open && (
        <div id="mobile-navigation-panel" className="mobile-nav-panel" ref={panelRef}>
          <span className="mobile-nav-label">REALMS</span>
          <div className="mobile-nav-grid">
            {REALM_DATA.map((realm, index) => (
              <button
                key={realm.id}
                type="button"
                className={`chapter-pill ${activeRealmIndex === index ? 'active' : ''}`}
                aria-current={activeRealmIndex === index ? 'page' : undefined}
                onClick={() => {
                  onWarp(index);
                  setOpen(false);
                }}
              >
                {realm.num} // {realm.kanji}
              </button>
            ))}
          </div>
          <span className="mobile-nav-label">CAMERA MODES</span>
          <div className="mobile-nav-grid">
            {CAMERA_MODES.map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                className={`cam-btn ${cameraMode === mode ? 'active' : ''}`}
                aria-pressed={cameraMode === mode}
                onClick={() => {
                  onCameraModeChange(mode);
                  setOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
