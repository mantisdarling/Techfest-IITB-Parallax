import React, { useState, useEffect, useRef, useCallback } from 'react';
import ThreeScene from './ThreeScene';
import { 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Eye, 
  X, 
  Terminal,
  MapPin,
  Crosshair,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import './App.css';

const REALM_DATA = [
  {
    id: 'gateway',
    num: '01',
    kanji: '飛翔',
    sfx: 'ドォォン!',
    tag: 'ORIGIN PORTAL // IIT BOMBAY',
    title: 'WHERE IDEAS TAKE FLIGHT',
    desc: 'The sacred grounds of Asia’s largest science and technology festival. Across 550 acres of IIT Bombay, thousands of engineers, inventors, and visionaries gather under the legendary Techfest Wall.',
    image: '/manga_mural.png',
    specs: [
      { label: 'FOOTFALL', val: '175,000+' },
      { label: 'COLLEGES', val: '2,500+' },
      { label: 'PATRONAGE', val: 'UNESCO & UNICEF' },
      { label: 'PRIZE MATRIX', val: '₹50+ LAKHS' }
    ]
  },
  {
    id: 'robowars',
    num: '02',
    kanji: '闘魂',
    sfx: 'ガガガッ!',
    tag: 'ARENA // 30nm CIRCUIT MAZE',
    title: 'MESHME RIZE ROBOWARS',
    desc: 'Autonomous micro rovers navigating hyper complex 30nm precision mazes with LiDAR sensors, sub millisecond line detection algorithms, and high torque titanium gears.',
    image: '/manga_bot_maze.png',
    specs: [
      { label: 'MAZE RESOLUTION', val: '30nm PRECISION' },
      { label: 'SPEED TRAVERSAL', val: '3.8 M/S MAX' },
      { label: 'SENSOR SUITE', val: 'LiDAR + IR RADAR' },
      { label: 'MECHA COMBAT', val: 'ROBOWARS INTERNATIONAL' }
    ]
  },
  {
    id: 'drones',
    num: '03',
    kanji: '群星',
    sfx: 'キィィン!',
    tag: 'SKYLINE SWARM // 500+ DRONES',
    title: 'CELESTIAL DRONE MATRIX',
    desc: 'Over the nighttime cityscape of Mumbai, 500 autonomous drones orchestrate into a massive 3D glowing celestial sphere. Real time swarm tele kinetics and satellite positioning.',
    image: '/manga_drone_sphere.png',
    specs: [
      { label: 'DRONE FLEET', val: '500+ QUADCOPTERS' },
      { label: 'FORMATION', val: '3D POKÉBALL ORB' },
      { label: 'GPS SYNC', val: 'RTK SUB CENTIMETER' },
      { label: 'ALTITUDE', val: '120 METERS' }
    ]
  },
  {
    id: 'stage',
    num: '04',
    kanji: '熱狂',
    sfx: 'ズバッ!',
    tag: 'THE APEX // TECHNOHOLIX ARENA',
    title: 'TECHNOHOLIX MEGASTAGE',
    desc: 'The grand fusion of cutting edge technology and sensory euphoria. Mammoth LED monolithic pillars, pyrotechnic laser grids, and world renowned EDM performers under the neon TF emblem.',
    image: '/manga_stage.png',
    specs: [
      { label: 'STAGE RIG', val: '360° LED MONOLITHS' },
      { label: 'AUDIO SYSTEM', val: '100,000 WATTS' },
      { label: 'INTERNATIONAL ACTS', val: '30+ COUNTRIES' },
      { label: 'SPECTATORS', val: '25,000 ARENA CAP' }
    ]
  }
];

const CAMPUS_VENUES = [
  { name: 'GYMKHANA GROUNDS', event: 'Robowars & Meshmerize', cap: '15,000', icon: '01' },
  { name: 'CONVOCATION HALL', event: 'World Technology Summit', cap: '2,500', icon: '02' },
  { name: 'OPEN AIR THEATRE (OAT)', event: 'Technoholix EDM Night', cap: '25,000', icon: '03' },
  { name: 'SAC LAWNS', event: 'Drone Light Show & Exhibits', cap: '10,000', icon: '04' }
];

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeRealmIndex, setActiveRealmIndex] = useState(0);
  const [cameraMode, setCameraMode] = useState('scroll'); // 'scroll' | 'orbit' | 'fpv' | 'cockpit'
  const [droneFormation, setDroneFormation] = useState('sphere'); // 'sphere' | 'tf' | 'falcon' | 'helix'
  const [djBeatTrigger, setDjBeatTrigger] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isLoopingBeat, setIsLoopingBeat] = useState(false);
  
  // Rover manual control state
  const [botControl, setBotControl] = useState({ x: 0, z: 0, active: false });
  const [botGoalAchieved, setBotGoalAchieved] = useState(false);

  // Modals with lazy initialization
  const [selectedDossier, setSelectedDossier] = useState(() => {
    if (typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search).get('dossier');
    return p ? REALM_DATA.find(r => r.id === p) || null : null;
  });
  const [campusMapOpen, setCampusMapOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  
  // Cyber pass customization
  const [passData, setPassData] = useState({
    name: 'COMMANDER ARCH',
    college: 'IIT BOMBAY',
    roll: 'TF 2026 9942',
    avatar: 'TITAN MECH'
  });

  const [speedlinesActive, setSpeedlinesActive] = useState(false);
  const lastScrollY = useRef(0);
  const speedlineTimeout = useRef(null);
  const djIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Lock body scroll when any modal is open
  useEffect(() => {
    document.body.style.overflow = (selectedDossier || campusMapOpen || passModalOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedDossier, campusMapOpen, passModalOpen]);

  // Single audio context for buttery smooth sound synthesis
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Procedural Web Audio synthesizer
  const playSfx = useCallback((type = 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'kick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'hihat') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(2200, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'synth') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'drop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'warp') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch {
      // Audio not available
    }
  }, [soundEnabled, getAudioContext]);

  // Warp to specific realm
  const warpToRealm = useCallback((index, immediate = false) => {
    playSfx('warp');
    setSpeedlinesActive(true);
    setTimeout(() => setSpeedlinesActive(false), 500);

    const target = REALM_DATA[index];
    if (target) {
      const el = document.getElementById(target.id);
      if (el) {
        el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
      }
    }
  }, [playSfx]);

  // DJ Beat Trigger
  const triggerDjPad = useCallback((sfxName) => {
    playSfx(sfxName);
    setDjBeatTrigger(true);
    setTimeout(() => setDjBeatTrigger(false), 140);
  }, [playSfx]);

  // DJ Loop Sequencer
  const toggleDjLoop = useCallback(() => {
    if (isLoopingBeat) {
      clearInterval(djIntervalRef.current);
      setIsLoopingBeat(false);
    } else {
      setIsLoopingBeat(true);
      let step = 0;
      djIntervalRef.current = setInterval(() => {
        const beatSeq = ['kick', 'hihat', 'synth', 'hihat', 'kick', 'hihat', 'drop', 'hihat'];
        triggerDjPad(beatSeq[step % beatSeq.length]);
        step++;
      }, 250);
    }
  }, [isLoopingBeat, triggerDjPad]);

  // Check URL params / hash on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const realmParam = params.get('realm');

    if (realmParam !== null) {
      const idx = parseInt(realmParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx < 4) {
        setTimeout(() => warpToRealm(idx, true), 50);
      }
    } else if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const idx = REALM_DATA.findIndex(r => r.id === id);
      if (idx !== -1) {
        setTimeout(() => warpToRealm(idx, true), 50);
      }
    }
  }, [warpToRealm]);

  // Smooth scroll listener for 3D camera travel
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const current = window.scrollY;
          const progress = maxScroll > 0 ? Math.min(Math.max(current / maxScroll, 0), 1) : 0;
          setScrollProgress(progress);

          const realmIdx = Math.min(Math.floor(progress * 4), 3);
          setActiveRealmIndex(realmIdx);

          const delta = Math.abs(current - lastScrollY.current);
          if (delta > 35) {
            setSpeedlinesActive(true);
            if (speedlineTimeout.current) clearTimeout(speedlineTimeout.current);
            speedlineTimeout.current = setTimeout(() => {
              setSpeedlinesActive(false);
            }, 300);
          }
          lastScrollY.current = current;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard controls for Rover (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeRealmIndex !== 1) return;
      let dx = 0;
      let dz = 0;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dz = -1;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dz = 1;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dx = -1;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dx = 1;

      if (dx !== 0 || dz !== 0) {
        setBotControl({ x: dx, z: dz, active: true });
        playSfx('click');
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        setBotControl(prev => ({ ...prev, x: 0, z: 0 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeRealmIndex, playSfx]);

  return (
    <div className="app-container">
      {/* 3D WebGL Canvas */}
      <ThreeScene 
        scrollProgress={scrollProgress}
        activeRealm={activeRealmIndex}
        cameraMode={cameraMode}
        droneFormation={droneFormation}
        djBeatTrigger={djBeatTrigger}
        botControl={botControl}
        onBotGoal={() => {
          if (!botGoalAchieved) {
            setBotGoalAchieved(true);
            playSfx('drop');
          }
        }}
        playSfx={playSfx}
      />

      {/* Speedline Action Burst */}
      <div className={`speedlines ${speedlinesActive ? 'active' : ''}`} aria-hidden="true" />

      {/* Cockpit Mode HUD Overlay */}
      {cameraMode === 'cockpit' && (
        <div className="cockpit-hud-overlay">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="cockpit-telemetry-left">
              [MECHA RADAR LOCK // 30nm GRID]<br />
              SPEED: {botControl.active ? '3.8 M/S' : '1.2 M/S'}<br />
              STATUS: {botGoalAchieved ? 'GOAL ACHIEVED!' : 'HUNTING CHECKPOINT'}
            </div>
            <div className="cockpit-telemetry-right">
              PITCH: 0.00° // ROLL: 0.00°<br />
              LiDAR: 360° ACTIVE<br />
              IITB COMBAT DIVISION
            </div>
          </div>

          <div className="cockpit-reticle-center">
            <span style={{ position: 'absolute', bottom: '-22px', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
              TARGET LOCK
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              type="button" 
              className="manga-btn"
              onClick={() => setCameraMode('scroll')}
            >
              EXIT COCKPIT VIEW [ESC]
            </button>
          </div>
        </div>
      )}

      {/* Top Manga Progress Bar */}
      <div className="scroll-tracker">
        <div 
          className="scroll-tracker-fill" 
          style={{ width: `${scrollProgress * 100}%` }} 
        />
      </div>

      {/* Top HUD Navigation */}
      <header className="manga-hud-header">
        <div className="hud-brand">
          <div className="hud-logo-box">TF</div>
          <div className="hud-brand-title">
            <span className="brand-main">TECHFEST 2026</span>
            <span className="brand-sub">IIT BOMBAY // アジア最大の技術祭</span>
          </div>
        </div>

        {/* 4 Chapter Quick Jumps */}
        <nav className="hud-chapters">
          {REALM_DATA.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={`chapter-pill ${activeRealmIndex === i ? 'active' : ''}`}
              onClick={() => warpToRealm(i)}
            >
              {r.num} // {r.kanji}
            </button>
          ))}
        </nav>

        {/* Camera Mode Selector */}
        <div className="camera-mode-group">
          <button
            type="button"
            className={`cam-btn ${cameraMode === 'scroll' ? 'active' : ''}`}
            onClick={() => { playSfx('click'); setCameraMode('scroll'); }}
            title="Scroll Camera"
          >
            SCROLL 3D
          </button>
          <button
            type="button"
            className={`cam-btn ${cameraMode === 'cockpit' ? 'active' : ''}`}
            onClick={() => { playSfx('warp'); setCameraMode('cockpit'); warpToRealm(1); }}
            title="First Person Mecha Cockpit"
          >
            COCKPIT
          </button>
          <button
            type="button"
            className={`cam-btn ${cameraMode === 'fpv' ? 'active' : ''}`}
            onClick={() => { playSfx('warp'); setCameraMode('fpv'); }}
            title="FPV Free Flight Drone"
          >
            FPV DRONE
          </button>
          <button
            type="button"
            className={`cam-btn ${cameraMode === 'orbit' ? 'active' : ''}`}
            onClick={() => { playSfx('click'); setCameraMode('orbit'); }}
            title="360 Orbit View"
          >
            360° ORBIT
          </button>
        </div>

        {/* Controls, Map & Pass */}
        <div className="hud-controls">
          <button
            type="button"
            className="control-icon-btn"
            onClick={() => {
              playSfx('click');
              setCampusMapOpen(true);
            }}
            title="View 3D Campus Venues"
            aria-label="Open campus venue map"
          >
            <MapPin size={14} />
            <span>MAP</span>
          </button>

          <button
            type="button"
            className="control-icon-btn"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playSfx('kick');
            }}
            title="Toggle Procedural Cyber Audio"
            aria-label="Toggle sound effects"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>SFX</span>
          </button>

          <button
            type="button"
            className="manga-btn"
            style={{ padding: '0.45rem 1rem', fontSize: '0.75rem' }}
            onClick={() => {
              playSfx('click');
              setPassModalOpen(true);
            }}
          >
            <span>GET PASS</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* 4 Manga Scroll Realms With Interactive Minigames */}
      <main>
        {REALM_DATA.map((realm, index) => {
          const isRight = index % 2 === 1;
          return (
            <section 
              key={realm.id} 
              id={realm.id} 
              className="scroll-realm"
            >
              <div className={`realm-content ${isRight ? 'right-aligned' : ''}`}>
                <div className="manga-panel-card">
                  {/* Flingable Manga Sound FX Kanji Badge */}
                  <div 
                    className="sound-fx-badge"
                    title="Click for Manga SFX Impact!"
                    onClick={() => {
                      playSfx('drop');
                      setSpeedlinesActive(true);
                      setTimeout(() => setSpeedlinesActive(false), 300);
                    }}
                  >
                    {realm.sfx}
                  </div>

                  <span className="manga-tag">{realm.tag}</span>
                  <h2 className="manga-title">{realm.title}</h2>
                  <p className="manga-desc">{realm.desc}</p>

                  {/* Realm 02 Special: Playable 30nm Rover Minigame */}
                  {index === 1 && (
                    <div className="rover-controller-box">
                      <div>
                        <div style={{ fontFamily: 'var(--font-manga)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                          🎮 PLAYABLE 30nm ROVER
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#AAAAAA' }}>
                          USE WASD / KEYS OR DPAD TO STEER
                        </div>
                        {botGoalAchieved && (
                          <div style={{ color: '#FFFFFF', fontFamily: 'var(--font-manga)', marginTop: '0.4rem' }}>
                            ★ CHECKPOINT CAPTURED!
                          </div>
                        )}
                      </div>

                      {/* On Screen Touch DPad */}
                      <div className="dpad-container">
                        <div />
                        <button 
                          type="button" 
                          className="dpad-btn"
                          onMouseDown={() => setBotControl({ x: 0, z: -1, active: true })}
                          onMouseUp={() => setBotControl(p => ({ ...p, x: 0, z: 0 }))}
                          onTouchStart={() => setBotControl({ x: 0, z: -1, active: true })}
                          onTouchEnd={() => setBotControl(p => ({ ...p, x: 0, z: 0 }))}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <div />
                        <button 
                          type="button" 
                          className="dpad-btn"
                          onMouseDown={() => setBotControl({ x: -1, z: 0, active: true })}
                          onMouseUp={() => setBotControl(p => ({ ...p, x: 0, z: 0 }))}
                          onTouchStart={() => setBotControl({ x: -1, z: 0, active: true })}
                          onTouchEnd={() => setBotControl(p => ({ ...p, x: 0, z: 0 }))}
                        >
                          <ArrowLeft size={16} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
                          <Crosshair size={12} />
                        </div>
                        <button 
                          type="button" 
                          className="dpad-btn"
                          onMouseDown={() => setBotControl({ x: 1, z: 0, active: true })}
                          onMouseUp={() => setBotControl(p => ({ ...p, x: 0, z: 0 }))}
                          onTouchStart={() => setBotControl({ x: 1, z: 0, active: true })}
                          onTouchEnd={() => setBotControl(p => ({ ...p, x: 0, z: 0 }))}
                        >
                          <ArrowRight size={16} />
                        </button>
                        <div />
                        <button 
                          type="button" 
                          className="dpad-btn"
                          onMouseDown={() => setBotControl({ x: 0, z: 1, active: true })}
                          onMouseUp={() => setBotControl(p => ({ ...p, x: 0, z: 0 }))}
                          onTouchStart={() => setBotControl({ x: 0, z: 1, active: true })}
                          onTouchEnd={() => setBotControl(p => ({ ...p, x: 0, z: 0 }))}
                        >
                          <ArrowDown size={16} />
                        </button>
                        <div />
                      </div>
                    </div>
                  )}

                  {/* Realm 03 Special: 500 Drone Swarm Formation Shifter */}
                  {index === 2 && (
                    <div>
                      <div style={{ fontFamily: 'var(--font-manga)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                        ⚡ MORPH 3D DRONE SWARM FORMATION:
                      </div>
                      <div className="drone-formation-bar">
                        <button
                          type="button"
                          className={`formation-btn ${droneFormation === 'sphere' ? 'active' : ''}`}
                          onClick={() => { playSfx('click'); setDroneFormation('sphere'); }}
                        >
                          01 // POKÉBALL
                        </button>
                        <button
                          type="button"
                          className={`formation-btn ${droneFormation === 'tf' ? 'active' : ''}`}
                          onClick={() => { playSfx('click'); setDroneFormation('tf'); }}
                        >
                          02 // TF CREST
                        </button>
                        <button
                          type="button"
                          className={`formation-btn ${droneFormation === 'falcon' ? 'active' : ''}`}
                          onClick={() => { playSfx('click'); setDroneFormation('falcon'); }}
                        >
                          03 // IITB FALCON
                        </button>
                        <button
                          type="button"
                          className={`formation-btn ${droneFormation === 'helix' ? 'active' : ''}`}
                          onClick={() => { playSfx('click'); setDroneFormation('helix'); }}
                        >
                          04 // QUANTUM HELIX
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Realm 04 Special: Technoholix DJ Synth Matrix */}
                  {index === 3 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontFamily: 'var(--font-manga)', fontSize: '0.8rem' }}>
                          🎛️ TECHNOHOLIX DJ SYNTH MATRIX:
                        </span>
                        <button
                          type="button"
                          className="manga-btn-outline"
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.65rem' }}
                          onClick={toggleDjLoop}
                        >
                          {isLoopingBeat ? 'STOP LOOP' : 'AUTOPLAY LOOP'}
                        </button>
                      </div>

                      <div className="dj-soundboard">
                        <button
                          type="button"
                          className={`dj-pad ${djBeatTrigger ? 'pulsing' : ''}`}
                          onClick={() => triggerDjPad('kick')}
                        >
                          <span className="dj-pad-key">[1]</span>
                          <span className="dj-pad-name">KICK</span>
                        </button>
                        <button
                          type="button"
                          className="dj-pad"
                          onClick={() => triggerDjPad('hihat')}
                        >
                          <span className="dj-pad-key">[2]</span>
                          <span className="dj-pad-name">HI HAT</span>
                        </button>
                        <button
                          type="button"
                          className="dj-pad"
                          onClick={() => triggerDjPad('synth')}
                        >
                          <span className="dj-pad-key">[3]</span>
                          <span className="dj-pad-name">SYNTH</span>
                        </button>
                        <button
                          type="button"
                          className="dj-pad"
                          onClick={() => triggerDjPad('drop')}
                        >
                          <span className="dj-pad-key">[4]</span>
                          <span className="dj-pad-name">BASS DROP</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="manga-specs-grid">
                    {realm.specs.map((s, idx) => (
                      <div key={idx} className="spec-item">
                        <span className="spec-label">{s.label}</span>
                        <span className="spec-val">{s.val}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="manga-btn"
                      onClick={() => {
                        playSfx('drop');
                        setSelectedDossier(realm);
                      }}
                    >
                      <Eye size={14} />
                      <span>INSPECT DOSSIER</span>
                    </button>

                    {index === 1 && (
                      <button
                        type="button"
                        className="manga-btn-outline"
                        onClick={() => setCameraMode('cockpit')}
                      >
                        <Crosshair size={14} />
                        <span>ENTER COCKPIT</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="manga-btn-outline"
                      onClick={() => warpToRealm((index + 1) % 4)}
                    >
                      <span>NEXT REALM</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {/* Bottom HUD Footer Telemetry */}
      <footer className="manga-hud-footer">
        <div className="hud-hint">
          <Terminal size={14} />
          <span>DRAG 3D TO ROTATE // WASD TO DRIVE ROVER // SCROLL TO WARP</span>
        </div>

        <div className="hud-telemetry-box">
          <div className="telemetry-item">
            <span className="lbl">MODE:</span>
            <span className="val">{cameraMode.toUpperCase()}</span>
          </div>
          <div className="telemetry-item">
            <span className="lbl">REALM:</span>
            <span className="val">{REALM_DATA[activeRealmIndex].num} / 04</span>
          </div>
          <div className="telemetry-item">
            <span className="lbl">DEPTH:</span>
            <span className="val">Z: {Math.round(400 - scrollProgress * 2200)}m</span>
          </div>
        </div>
      </footer>

      {/* Campus Venue Map Modal */}
      {campusMapOpen && (
        <div 
          className="dossier-modal-overlay"
          onClick={() => setCampusMapOpen(false)}
        >
          <div 
            className="dossier-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dossier-header">
              <span style={{ fontFamily: 'var(--font-manga)', fontSize: '1rem' }}>
                🗺️ IIT BOMBAY // 3D ISOMETRIC FESTIVAL VENUES
              </span>
              <button 
                type="button"
                className="modal-close"
                onClick={() => setCampusMapOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dossier-content">
              <p style={{ color: '#AAAAAA', fontSize: '0.9rem', marginBottom: '1rem' }}>
                550 Acres of Innovation. Select a venue to warp the 3D camera to its active competition realm:
              </p>

              <div className="campus-map-grid">
                {CAMPUS_VENUES.map((v, i) => (
                  <div 
                    key={i} 
                    className="venue-card"
                    onClick={() => {
                      setCampusMapOpen(false);
                      warpToRealm(i);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span className="hud-logo-box" style={{ fontSize: '0.7rem' }}>{v.icon}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888' }}>
                        CAP: {v.cap}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-manga)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                      {v.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#CCCCCC' }}>
                      {v.event}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manga Dossier Modal */}
      {selectedDossier && (
        <div 
          className="dossier-modal-overlay"
          onClick={() => setSelectedDossier(null)}
        >
          <div 
            className="dossier-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dossier-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="hud-logo-box" style={{ fontSize: '0.85rem' }}>DOSSIER</span>
                <span style={{ fontFamily: 'var(--font-manga)', fontSize: '1rem' }}>
                  {selectedDossier.title}
                </span>
              </div>
              <button 
                type="button"
                className="modal-close"
                onClick={() => setSelectedDossier(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dossier-content">
              <div className="dossier-image-frame">
                <img 
                  src={selectedDossier.image} 
                  alt={selectedDossier.title}
                  className="dossier-img"
                  loading="eager"
                  decoding="async"
                />
              </div>

              <p style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7', color: '#CCCCCC', marginBottom: '1.5rem' }}>
                {selectedDossier.desc}
              </p>

              <div className="manga-specs-grid">
                {selectedDossier.specs.map((s, i) => (
                  <div key={i} className="spec-item">
                    <span className="spec-label">{s.label}</span>
                    <span className="spec-val" style={{ fontSize: '0.9rem' }}>{s.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="manga-btn"
                  onClick={() => {
                    setSelectedDossier(null);
                    setPassModalOpen(true);
                  }}
                >
                  <span>CLAIM FESTIVAL PASS</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Manga Cyber Pass Generator */}
      {passModalOpen && (
        <div 
          className="dossier-modal-overlay"
          onClick={() => setPassModalOpen(false)}
        >
          <div 
            className="dossier-card"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dossier-header">
              <span style={{ fontFamily: 'var(--font-manga)', fontSize: '0.95rem' }}>
                🎟️ CUSTOM MANGA CYBER PASS GENERATOR
              </span>
              <button 
                type="button"
                className="modal-close"
                onClick={() => setPassModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dossier-content">
              {/* Live Manga Ticket Preview */}
              <div className="ticket-canvas-frame">
                <div className="ticket-header-row">
                  <div>
                    <span className="hud-logo-box" style={{ fontSize: '0.75rem' }}>TECHFEST 2026</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', marginLeft: '0.5rem', letterSpacing: '0.15em' }}>
                      OFFICIAL BOARDING PASS
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-manga)', fontSize: '0.8rem' }}>IIT BOMBAY</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-manga)', fontSize: '1.35rem', textTransform: 'uppercase' }}>
                      {passData.name || 'ANONYMOUS CYBORG'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#AAAAAA' }}>
                      COLLEGE: {passData.college || 'IIT BOMBAY'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#AAAAAA' }}>
                      ID TOKEN: {passData.roll || 'TF 2026 X01'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#FFFFFF', marginTop: '0.25rem' }}>
                      DIVISION: {passData.avatar}
                    </div>
                  </div>

                  {/* QR Code Vector Mock */}
                  <div style={{ border: '2px solid #FFFFFF', padding: '0.5rem', background: '#FFFFFF', color: '#000000', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 'bold' }}>
                      [QR VERIFIED]
                    </div>
                    <div style={{ height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Terminal size={32} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem' }}>
                      UNESCO COMPLIANT
                    </div>
                  </div>
                </div>

                {/* Ticket Barcode */}
                <div className="ticket-barcode" />
              </div>

              {/* Pass Customizer Form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888888', marginBottom: '0.3rem' }}>
                    CALLSIGN / YOUR NAME
                  </label>
                  <input 
                    type="text"
                    value={passData.name}
                    onChange={(e) => setPassData(p => ({ ...p, name: e.target.value }))}
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '2px solid #FFFFFF',
                      color: '#FFF',
                      padding: '0.6rem 0.8rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888888', marginBottom: '0.3rem' }}>
                    INSTITUTE / COLLEGE
                  </label>
                  <input 
                    type="text"
                    value={passData.college}
                    onChange={(e) => setPassData(p => ({ ...p, college: e.target.value }))}
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '2px solid #FFFFFF',
                      color: '#FFF',
                      padding: '0.6rem 0.8rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888888', marginBottom: '0.4rem' }}>
                  SELECT CYBER DIVISION
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['TITAN MECH', 'SWARM FALCON', 'CYBER SAMURAI', 'QUANTUM BIO HACKER'].map((av) => (
                    <button
                      key={av}
                      type="button"
                      className={`formation-btn ${passData.avatar === av ? 'active' : ''}`}
                      onClick={() => setPassData(p => ({ ...p, avatar: av }))}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="button"
                className="manga-btn"
                style={{ width: '100%' }}
                onClick={() => {
                  playSfx('drop');
                  alert(`[SUCCESS] Manga Boarding Pass Generated for ${passData.name}! Token stored.`);
                  setPassModalOpen(false);
                }}
              >
                <Download size={16} />
                <span>SAVE & DOWNLOAD BOARDING PASS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
