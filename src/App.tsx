import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { REALM_DATA } from './data/realms';
import { realmIndexFromLocation } from './lib/url';
import { useAudioSynth } from './hooks/useAudioSynth';
import { useScrollTracking } from './hooks/useScrollTracking';
import { useRoverControls } from './hooks/useRoverControls';
import { useDjSequencer } from './hooks/useDjSequencer';
import { useModals } from './hooks/useModals';
import HeaderHud from './components/HeaderHud';
import FooterHud from './components/FooterHud';
import CockpitHud from './components/CockpitHud';
import RealmSection from './components/RealmSection';
import CampusMapModal from './components/CampusMapModal';
import DossierModal from './components/DossierModal';
import PassModal from './components/PassModal';
import type { CameraMode, DroneFormation, RealmData } from './types';
import './App.css';

const ThreeScene = lazy(() => import('./ThreeScene'));

export default function App() {
  const { scrollProgress, activeRealmIndex, speedlinesActive, flashSpeedlines } =
    useScrollTracking();
  const { soundEnabled, toggleSound, playSfx } = useAudioSynth();
  const { botControl, setBotControl, botGoalAchieved, setBotGoalAchieved } = useRoverControls(
    activeRealmIndex,
    playSfx
  );
  const { djBeatTrigger, isLoopingBeat, triggerDjPad, toggleDjLoop } = useDjSequencer(playSfx);
  const { modalState, modalActions } = useModals();

  const [cameraMode, setCameraMode] = useState<CameraMode>('scroll');
  const [droneFormation, setDroneFormation] = useState<DroneFormation>('sphere');
  const goalCapturedRef = useRef(false);

  const warpToRealm = useCallback(
    (index: number, immediate = false) => {
      playSfx('warp');
      flashSpeedlines(500);
      const target = REALM_DATA[index];
      if (target) {
        document
          .getElementById(target.id)
          ?.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
      }
    },
    [playSfx, flashSpeedlines]
  );

  useEffect(() => {
    const idx = realmIndexFromLocation(window.location.search, window.location.hash);
    if (idx !== null) {
      const timer = setTimeout(() => warpToRealm(idx, true), 50);
      return () => clearTimeout(timer);
    }
  }, [warpToRealm]);

  const handleCameraModeChange = useCallback(
    (mode: CameraMode) => {
      playSfx(mode === 'cockpit' || mode === 'fpv' ? 'warp' : 'click');
      setCameraMode(mode);
      if (mode === 'cockpit') warpToRealm(1);
    },
    [playSfx, warpToRealm]
  );

  const handleBotGoal = useCallback(() => {
    if (!goalCapturedRef.current) {
      goalCapturedRef.current = true;
      setBotGoalAchieved(true);
      playSfx('drop');
    }
  }, [playSfx, setBotGoalAchieved]);

  const handleFormationChange = useCallback(
    (formation: DroneFormation) => {
      playSfx('click');
      setDroneFormation(formation);
    },
    [playSfx]
  );

  const handleSfxBadge = useCallback(() => {
    playSfx('drop');
    flashSpeedlines(300);
  }, [playSfx, flashSpeedlines]);

  const handleInspect = useCallback(
    (realm: RealmData) => {
      playSfx('drop');
      modalActions.openDossier(realm);
    },
    [playSfx, modalActions]
  );

  const handleOpenMap = useCallback(() => {
    playSfx('click');
    modalActions.openMap();
  }, [playSfx, modalActions]);

  const handleOpenPass = useCallback(() => {
    playSfx('click');
    modalActions.openPass();
  }, [playSfx, modalActions]);

  const handleSteerRelease = useCallback(() => {
    setBotControl((prev) => ({ ...prev, x: 0, z: 0 }));
  }, [setBotControl]);

  const handleExitCockpit = useCallback(() => setCameraMode('scroll'), []);
  const handleEnterCockpit = useCallback(() => setCameraMode('cockpit'), []);
  const handleNextRealm = useCallback(
    (index: number) => warpToRealm((index + 1) % REALM_DATA.length),
    [warpToRealm]
  );

  return (
    <div className="app-container">
      <Suspense fallback={<div className="scene-loading">LOADING 3D EXPERIENCE...</div>}>
        <ThreeScene
          scrollProgress={scrollProgress}
          cameraMode={cameraMode}
          droneFormation={droneFormation}
          djBeatTrigger={djBeatTrigger}
          botControl={botControl}
          onBotGoal={handleBotGoal}
        />
      </Suspense>

      <div className={`speedlines ${speedlinesActive ? 'active' : ''}`} aria-hidden="true" />

      {cameraMode === 'cockpit' && (
        <CockpitHud
          botActive={botControl.active}
          goalAchieved={botGoalAchieved}
          onExit={handleExitCockpit}
        />
      )}

      <progress
        className="scroll-tracker"
        value={scrollProgress}
        max={1}
        aria-label="Reading progress"
      />

      <HeaderHud
        activeRealmIndex={activeRealmIndex}
        cameraMode={cameraMode}
        soundEnabled={soundEnabled}
        onWarp={warpToRealm}
        onCameraModeChange={handleCameraModeChange}
        onToggleSound={toggleSound}
        onOpenMap={handleOpenMap}
        onOpenPass={handleOpenPass}
      />

      <main>
        {REALM_DATA.map((realm, index) => (
          <RealmSection
            key={realm.id}
            realm={realm}
            index={index}
            botGoalAchieved={botGoalAchieved}
            onSteer={setBotControl}
            onSteerRelease={handleSteerRelease}
            droneFormation={droneFormation}
            onFormationChange={handleFormationChange}
            djBeatPulsing={djBeatTrigger}
            isDjLooping={isLoopingBeat}
            onDjPad={triggerDjPad}
            onToggleDjLoop={toggleDjLoop}
            onSfxBadge={handleSfxBadge}
            onInspect={handleInspect}
            onEnterCockpit={handleEnterCockpit}
            onNextRealm={handleNextRealm}
          />
        ))}
      </main>

      <FooterHud
        cameraMode={cameraMode}
        activeRealmIndex={activeRealmIndex}
        scrollProgress={scrollProgress}
      />

      {modalState.campusMapOpen && (
        <CampusMapModal onClose={modalActions.closeMap} onWarp={warpToRealm} />
      )}

      {modalState.dossier && (
        <DossierModal
          realm={modalState.dossier}
          onClose={modalActions.closeDossier}
          onCreatePass={() => {
            modalActions.closeDossier();
            modalActions.openPass();
          }}
        />
      )}

      {modalState.passModalOpen && <PassModal onClose={modalActions.closePass} />}
    </div>
  );
}
