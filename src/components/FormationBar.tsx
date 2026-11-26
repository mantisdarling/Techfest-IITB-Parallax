import type { DroneFormation } from '../types';

interface Props {
  formation: DroneFormation;
  onChange: (formation: DroneFormation) => void;
}

const FORMATIONS: Array<{ id: DroneFormation; label: string }> = [
  { id: 'sphere', label: '01 // POKÉBALL' },
  { id: 'tf', label: '02 // TF CREST' },
  { id: 'falcon', label: '03 // IITB FALCON' },
  { id: 'helix', label: '04 // QUANTUM HELIX' },
];

export default function FormationBar({ formation, onChange }: Props) {
  return (
    <div>
      <div className="formation-label">⚡ MORPH 3D DRONE SWARM FORMATION:</div>
      <div className="drone-formation-bar">
        {FORMATIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`formation-btn ${formation === id ? 'active' : ''}`}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
