import type { SfxType } from '../types';

interface Props {
  beatPulsing: boolean;
  isLooping: boolean;
  onPad: (sfx: SfxType) => void;
  onToggleLoop: () => void;
}

const PADS: Array<{ sfx: SfxType; key: string; name: string }> = [
  { sfx: 'kick', key: '[1]', name: 'KICK' },
  { sfx: 'hihat', key: '[2]', name: 'HI HAT' },
  { sfx: 'synth', key: '[3]', name: 'SYNTH' },
  { sfx: 'drop', key: '[4]', name: 'BASS DROP' },
];

export default function DjSoundboard({ beatPulsing, isLooping, onPad, onToggleLoop }: Props) {
  return (
    <div>
      <div className="dj-header-row">
        <span className="dj-title">🎛️ TECHNOHOLIX DJ SYNTH MATRIX:</span>
        <button type="button" className="manga-btn-outline dj-loop-btn" onClick={onToggleLoop}>
          {isLooping ? 'STOP LOOP' : 'AUTOPLAY LOOP'}
        </button>
      </div>

      <div className="dj-soundboard">
        {PADS.map(({ sfx, key, name }, i) => (
          <button
            key={sfx}
            type="button"
            className={`dj-pad ${beatPulsing && i === 0 ? 'pulsing' : ''}`}
            onClick={() => onPad(sfx)}
          >
            <span className="dj-pad-key">{key}</span>
            <span className="dj-pad-name">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
