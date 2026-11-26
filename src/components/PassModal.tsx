import { Download, Terminal, X } from 'lucide-react';
import { CYBER_DIVISIONS } from '../data/realms';
import { useModalFocus } from '../hooks/useModalFocus';
import type { PassData } from '../types';

interface Props {
  passData: PassData;
  onChange: (data: PassData) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function PassModal({ passData, onChange, onClose, onSave }: Props) {
  const dialogRef = useModalFocus<HTMLDivElement>();
  return (
    <div className="dossier-modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="dossier-card pass-card"
        role="dialog"
        aria-modal="true"
        aria-label="Cyber pass generator"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dossier-header">
          <span className="pass-title">🎟️ CUSTOM MANGA CYBER PASS GENERATOR</span>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close pass generator"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dossier-content">
          <div className="ticket-canvas-frame">
            <div className="ticket-header-row">
              <div>
                <span className="hud-logo-box ticket-logo">TECHFEST 2026</span>
                <span className="ticket-official-label">OFFICIAL BOARDING PASS</span>
              </div>
              <span className="ticket-iitb">IIT BOMBAY</span>
            </div>

            <div className="ticket-grid">
              <div>
                <div className="ticket-name">{passData.name || 'ANONYMOUS CYBORG'}</div>
                <div className="ticket-meta">COLLEGE: {passData.college || 'IIT BOMBAY'}</div>
                <div className="ticket-meta">ID TOKEN: {passData.roll || 'TF 2026 X01'}</div>
                <div className="ticket-division">DIVISION: {passData.avatar}</div>
              </div>

              <div className="ticket-qr">
                <div className="ticket-qr-label">[QR VERIFIED]</div>
                <div className="ticket-qr-icon">
                  <Terminal size={32} />
                </div>
                <div className="ticket-qr-sub">UNESCO COMPLIANT</div>
              </div>
            </div>

            <div className="ticket-barcode" />
          </div>

          <div className="pass-form-grid">
            <div>
              <label className="pass-label" htmlFor="pass-name">
                CALLSIGN / YOUR NAME
              </label>
              <input
                id="pass-name"
                type="text"
                className="pass-input"
                value={passData.name}
                onChange={(e) => onChange({ ...passData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="pass-label" htmlFor="pass-college">
                INSTITUTE / COLLEGE
              </label>
              <input
                id="pass-college"
                type="text"
                className="pass-input"
                value={passData.college}
                onChange={(e) => onChange({ ...passData, college: e.target.value })}
              />
            </div>
          </div>

          <div className="pass-division-section">
            <span className="pass-label pass-division-label">SELECT CYBER DIVISION</span>
            <div className="pass-division-row">
              {CYBER_DIVISIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  className={`formation-btn ${passData.avatar === av ? 'active' : ''}`}
                  onClick={() => onChange({ ...passData, avatar: av })}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="manga-btn pass-save-btn" onClick={onSave}>
            <Download size={16} />
            <span>SAVE &amp; DOWNLOAD BOARDING PASS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
