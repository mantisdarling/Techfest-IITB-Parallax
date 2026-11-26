import { ChevronRight, X } from 'lucide-react';
import type { RealmData } from '../types';

interface Props {
  realm: RealmData;
  onClose: () => void;
  onClaimPass: () => void;
}

export default function DossierModal({ realm, onClose, onClaimPass }: Props) {
  return (
    <div className="dossier-modal-overlay" onClick={onClose}>
      <div
        className="dossier-card"
        role="dialog"
        aria-modal="true"
        aria-label="Realm dossier"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dossier-header">
          <div className="dossier-header-left">
            <span className="hud-logo-box dossier-logo">DOSSIER</span>
            <span className="dossier-title">{realm.title}</span>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close dossier"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dossier-content">
          <div className="dossier-image-frame">
            <img
              src={realm.image}
              alt={realm.title}
              className="dossier-img"
              loading="eager"
              decoding="async"
            />
          </div>

          <p className="dossier-desc">{realm.desc}</p>

          <div className="manga-specs-grid">
            {realm.specs.map((s) => (
              <div key={s.label} className="spec-item">
                <span className="spec-label">{s.label}</span>
                <span className="spec-val dossier-spec-val">{s.val}</span>
              </div>
            ))}
          </div>

          <div className="dossier-footer">
            <button type="button" className="manga-btn" onClick={onClaimPass}>
              <span>CLAIM FESTIVAL PASS</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
