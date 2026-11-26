import { memo } from 'react';
import { ChevronRight, Crosshair, Eye } from 'lucide-react';
import type { BotControl, DroneFormation, RealmData, SfxType } from '../types';
import RoverController from './RoverController';
import FormationBar from './FormationBar';
import DjSoundboard from './DjSoundboard';

interface Props {
  realm: RealmData;
  index: number;
  botGoalAchieved: boolean;
  onSteer: (control: BotControl) => void;
  onSteerRelease: () => void;
  droneFormation: DroneFormation;
  onFormationChange: (formation: DroneFormation) => void;
  djBeatPulsing: boolean;
  isDjLooping: boolean;
  onDjPad: (sfx: SfxType) => void;
  onToggleDjLoop: () => void;
  onSfxBadge: () => void;
  onInspect: (realm: RealmData) => void;
  onEnterCockpit: () => void;
  onNextRealm: (index: number) => void;
}

function RealmSection({
  realm,
  index,
  botGoalAchieved,
  onSteer,
  onSteerRelease,
  droneFormation,
  onFormationChange,
  djBeatPulsing,
  isDjLooping,
  onDjPad,
  onToggleDjLoop,
  onSfxBadge,
  onInspect,
  onEnterCockpit,
  onNextRealm,
}: Props) {
  const isRight = index % 2 === 1;
  return (
    <section id={realm.id} className="scroll-realm">
      <div className={`realm-content ${isRight ? 'right-aligned' : ''}`}>
        <div className="manga-panel-card">
          <button
            type="button"
            className="sound-fx-badge"
            title="Click for Manga SFX Impact!"
            aria-label={`Play manga sound effect for ${realm.title}`}
            onClick={onSfxBadge}
          >
            {realm.sfx}
          </button>

          <span className="manga-tag">{realm.tag}</span>
          <h2 className="manga-title">{realm.title}</h2>
          <p className="manga-desc">{realm.desc}</p>

          {index === 1 && (
            <RoverController
              goalAchieved={botGoalAchieved}
              onSteer={onSteer}
              onRelease={onSteerRelease}
            />
          )}

          {index === 2 && <FormationBar formation={droneFormation} onChange={onFormationChange} />}

          {index === 3 && (
            <DjSoundboard
              beatPulsing={djBeatPulsing}
              isLooping={isDjLooping}
              onPad={onDjPad}
              onToggleLoop={onToggleDjLoop}
            />
          )}

          <div className="manga-specs-grid">
            {realm.specs.map((s) => (
              <div key={s.label} className="spec-item">
                <span className="spec-label">{s.label}</span>
                <span className="spec-val">{s.val}</span>
              </div>
            ))}
          </div>

          <div className="realm-actions">
            <button type="button" className="manga-btn" onClick={() => onInspect(realm)}>
              <Eye size={14} />
              <span>INSPECT DOSSIER</span>
            </button>

            {index === 1 && (
              <button type="button" className="manga-btn-outline" onClick={onEnterCockpit}>
                <Crosshair size={14} />
                <span>ENTER COCKPIT</span>
              </button>
            )}

            <button type="button" className="manga-btn-outline" onClick={() => onNextRealm(index)}>
              <span>NEXT REALM</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(RealmSection);
