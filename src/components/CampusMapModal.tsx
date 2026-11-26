import { X } from 'lucide-react';
import { CAMPUS_VENUES } from '../data/realms';

interface Props {
  onClose: () => void;
  onWarp: (index: number) => void;
}

export default function CampusMapModal({ onClose, onWarp }: Props) {
  return (
    <div className="dossier-modal-overlay" onClick={onClose}>
      <div
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
            {CAMPUS_VENUES.map((v, i) => (
              <div
                key={v.name}
                className="venue-card"
                role="button"
                tabIndex={0}
                onClick={() => {
                  onClose();
                  onWarp(i);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onClose();
                    onWarp(i);
                  }
                }}
              >
                <div className="venue-top-row">
                  <span className="hud-logo-box venue-icon">{v.icon}</span>
                  <span className="venue-cap">CAP: {v.cap}</span>
                </div>
                <div className="venue-name">{v.name}</div>
                <div className="venue-event">{v.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
