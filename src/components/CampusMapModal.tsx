import { X } from 'lucide-react';
import { CAMPUS_VENUES } from '../data/realms';
import { useModalFocus } from '../hooks/useModalFocus';

interface Props {
  onClose: () => void;
  onWarp: (index: number) => void;
}

export default function CampusMapModal({ onClose, onWarp }: Props) {
  const dialogRef = useModalFocus<HTMLDivElement>(onClose);
  return (
    <div className="dossier-modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="dossier-card"
        role="dialog"
        aria-modal="true"
        aria-label="Campus venue map"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dossier-header">
          <span className="dossier-title">🗺️ IIT BOMBAY // 3D ISOMETRIC FESTIVAL VENUES</span>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close campus map"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dossier-content">
          <p className="modal-intro">
            550 Acres of Innovation. Select a venue to warp the 3D camera to its active competition
            realm:
          </p>

          <div className="campus-map-grid">
            {CAMPUS_VENUES.map((v) => (
              <button
                key={v.name}
                type="button"
                className="venue-card"
                onClick={() => {
                  onClose();
                  onWarp(v.realmIndex);
                }}
              >
                <div className="venue-top-row">
                  <span className="hud-logo-box venue-icon">{v.icon}</span>
                  <span className="venue-cap">CAP: {v.cap}</span>
                </div>
                <div className="venue-name">{v.name}</div>
                <div className="venue-event">{v.event}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
