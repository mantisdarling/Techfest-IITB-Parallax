import { Download, Terminal, X } from 'lucide-react';
import { useState } from 'react';
import { CYBER_DIVISIONS, DEFAULT_PASS_DATA } from '../data/realms';
import { useModalFocus } from '../hooks/useModalFocus';
import type { PassData } from '../types';

interface Props {
  onClose: () => void;
}

function sanitizePassText(value: string, maxLength: number): string {
  return value.replace(/[\u0000-\u001f\u007f-\u009f]/g, '').slice(0, maxLength);
}

export default function PassModal({ onClose }: Props) {
  const [passData, setPassData] = useState<PassData>(DEFAULT_PASS_DATA);
  const dialogRef = useModalFocus<HTMLDivElement>(onClose);

  const updateField = (field: 'name' | 'college', value: string) => {
    const sanitized = sanitizePassText(value, field === 'name' ? 48 : 80);
    setPassData((current) => ({ ...current, [field]: sanitized }));
  };

  const handleSave = () => {
    const name = passData.name.trim() || 'ANONYMOUS CYBORG';
    const college = passData.college.trim() || 'INDEPENDENT EXPLORER';
    const content = [
      'TECHFEST 2026 MANGA KEEPSAKE',
      'This fan keepsake is not valid for event entry.',
      '',
      `CALLSIGN: ${name}`,
      `INSTITUTE: ${college}`,
      `DIVISION: ${passData.avatar}`,
      `DESIGN SERIES: ${passData.roll}`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'techfest-manga-keepsake.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    onClose();
  };

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
          <span className="pass-title">CUSTOM MANGA CYBER KEEPSAKE</span>
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
                <span className="ticket-official-label">FAN KEEPSAKE // NOT VALID FOR ENTRY</span>
              </div>
              <span className="ticket-iitb">IIT BOMBAY</span>
            </div>

            <div className="ticket-grid">
              <div>
                <div className="ticket-name">{passData.name || 'ANONYMOUS CYBORG'}</div>
                <div className="ticket-meta">COLLEGE: {passData.college || 'IIT BOMBAY'}</div>
                <div className="ticket-meta">DESIGN SERIES: {passData.roll}</div>
                <div className="ticket-division">DIVISION: {passData.avatar}</div>
              </div>

              <div className="ticket-qr">
                <div className="ticket-qr-label">FAN PASS</div>
                <div className="ticket-qr-icon">
                  <Terminal size={32} />
                </div>
                <div className="ticket-qr-sub">NO ENTRY ACCESS</div>
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
                maxLength={48}
                autoComplete="name"
                onChange={(e) => updateField('name', e.target.value)}
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
                maxLength={80}
                autoComplete="organization"
                onChange={(e) => updateField('college', e.target.value)}
              />
            </div>
          </div>

          <div className="pass-division-section">
            <span className="pass-label pass-division-label">SELECT CYBER DIVISION</span>
            <div className="pass-division-row">
              {CYBER_DIVISIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  className={`formation-btn ${passData.avatar === avatar ? 'active' : ''}`}
                  aria-pressed={passData.avatar === avatar}
                  onClick={() => setPassData((current) => ({ ...current, avatar }))}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="manga-btn pass-save-btn" onClick={handleSave}>
            <Download size={16} />
            <span>SAVE MANGA KEEPSAKE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
