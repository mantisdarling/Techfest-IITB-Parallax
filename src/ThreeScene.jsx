import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeScene({ 
  scrollProgress, 
  cameraMode, // 'scroll' | 'orbit' | 'fpv' | 'cockpit'
  droneFormation, // 'sphere' | 'tf' | 'falcon' | 'helix'
  djBeatTrigger,
  botControl, // { x, z, active }
  onBotGoal
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const objectsRef = useRef({});
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(scrollProgress);
  const cameraModeRef = useRef(cameraMode);
  const droneFormationRef = useRef(droneFormation);
  const djBeatRef = useRef(djBeatTrigger);
  const botControlRef = useRef(botControl);
  const onBotGoalRef = useRef(onBotGoal);
  useEffect(() => { onBotGoalRef.current = onBotGoal; }, [onBotGoal]);

  // Keep refs synchronized
  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);
  useEffect(() => { cameraModeRef.current = cameraMode; }, [cameraMode]);
  useEffect(() => { droneFormationRef.current = droneFormation; }, [droneFormation]);
  useEffect(() => { djBeatRef.current = djBeatTrigger; }, [djBeatTrigger]);
  useEffect(() => { botControlRef.current = botControl; }, [botControl]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    // Smooth distance fog hides distant realms without visual bleed
    scene.fog = new THREE.Fog(0x000000, 300, 750);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 4000);
    camera.position.set(0, 0, 400);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const textureLoader = new THREE.TextureLoader();

    // =========================================================================
    // 1. MANGA SCREENTONE PARTICLES
    // =========================================================================
    const particleCount = 1400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 1800;
      particlePositions[i + 1] = (Math.random() - 0.5) * 1800;
      particlePositions[i + 2] = (Math.random() - 0.5) * 2600 - 600;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.2,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    scene.add(starField);

    // =========================================================================
    // 2. REALM 1: THE GATEWAY & WALL MURAL (Z: 200)
    // =========================================================================
    const realm1Group = new THREE.Group();
    realm1Group.position.set(0, 0, 200);

    const muralTex = textureLoader.load('/manga_mural.png');
    const muralMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.MeshBasicMaterial({ map: muralTex, side: THREE.DoubleSide })
    );
    muralMesh.position.set(60, 10, 0);
    muralMesh.rotation.y = -0.25;
    realm1Group.add(muralMesh);

    const muralBoxWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(162, 162, 8)),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    muralBoxWire.position.copy(muralMesh.position);
    muralBoxWire.rotation.copy(muralMesh.rotation);
    realm1Group.add(muralBoxWire);

    // Rotating Torus Gate
    const ringGeo = new THREE.TorusGeometry(85, 2.5, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.set(-60, 0, -20);
    realm1Group.add(ring1);
    objectsRef.current.ring1 = ring1;

    scene.add(realm1Group);
    objectsRef.current.realm1 = realm1Group;

    // =========================================================================
    // 3. REALM 2: MESHME RIZE / 30nm ROBOWARS ARENA (Z: neg 500)
    // =========================================================================
    const realm2Group = new THREE.Group();
    realm2Group.position.set(0, 0, -500);

    // 30nm Wireframe Circuit Maze Floor
    const gridHelper = new THREE.GridHelper(340, 24, 0xffffff, 0x444444);
    gridHelper.position.set(0, -60, 0);
    realm2Group.add(gridHelper);

    // Maze Barrier Walls (Black solid with white wireframe edges)
    const mazeWallsGroup = new THREE.Group();
    mazeWallsGroup.position.set(0, -50, 0);

    const wallCoords = [
      [-90, 0, 10, 80],
      [90, 0, 10, 80],
      [0, -60, 120, 10],
      [0, 60, 120, 10],
      [-40, -20, 10, 60],
      [40, 20, 10, 60],
      [0, 0, 50, 10],
    ];

    wallCoords.forEach(([wx, wz, ww, wd]) => {
      const wGeo = new THREE.BoxGeometry(ww, 20, wd);
      const wMesh = new THREE.Mesh(wGeo, new THREE.MeshBasicMaterial({ color: 0x111111 }));
      const wWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(wGeo),
        new THREE.LineBasicMaterial({ color: 0xffffff })
      );
      wMesh.position.set(wx, 0, wz);
      wWire.position.set(wx, 0, wz);
      mazeWallsGroup.add(wMesh);
      mazeWallsGroup.add(wWire);
    });
    realm2Group.add(mazeWallsGroup);

    // Goal Checkpoint Terminal (Rotating white wireframe octagonal beacon)
    const goalGeo = new THREE.OctahedronGeometry(12, 0);
    const goalMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const goalMesh = new THREE.Mesh(goalGeo, goalMat);
    goalMesh.position.set(70, -45, -70);
    realm2Group.add(goalMesh);
    objectsRef.current.goalMesh = goalMesh;

    // 3D Playable / Autonomous Robot
    const botGroup = new THREE.Group();
    botGroup.position.set(-60, -48, 60);

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(36, 18, 44);
    const chassisMesh = new THREE.Mesh(chassisGeo, new THREE.MeshBasicMaterial({ color: 0x050505 }));
    const chassisWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(chassisGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    botGroup.add(chassisMesh);
    botGroup.add(chassisWire);

    // 4 Wheels
    for (let x of [-20, 20]) {
      for (let z of [-15, 15]) {
        const wheelGeo = new THREE.CylinderGeometry(8, 8, 5, 12);
        const wheel = new THREE.Mesh(wheelGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, -5, z);
        botGroup.add(wheel);
      }
    }

    // LiDAR Scanner & Radar
    const lidarGeo = new THREE.CylinderGeometry(5, 5, 7, 8);
    const lidar = new THREE.Mesh(lidarGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
    lidar.position.set(0, 13, 0);
    botGroup.add(lidar);
    objectsRef.current.lidar = lidar;

    const radarGeo = new THREE.RingGeometry(12, 14, 24);
    const radar = new THREE.Mesh(radarGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    radar.rotation.x = -Math.PI / 2;
    radar.position.set(0, 14, 0);
    botGroup.add(radar);
    objectsRef.current.radar = radar;

    // Bot Billboard
    const botTex = textureLoader.load('/manga_bot_maze.png');
    const botBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(130, 130),
      new THREE.MeshBasicMaterial({ map: botTex, side: THREE.DoubleSide })
    );
    botBoard.position.set(-90, 25, -50);
    botBoard.rotation.y = 0.35;
    realm2Group.add(botBoard);

    realm2Group.add(botGroup);
    scene.add(realm2Group);
    objectsRef.current.realm2 = realm2Group;
    objectsRef.current.bot = botGroup;

    // =========================================================================
    // 4. REALM 3: CELESTIAL DRONE SWARM (Z: neg 1100) WITH MORPHING FORMATIONS
    // =========================================================================
    const realm3Group = new THREE.Group();
    realm3Group.position.set(0, 0, -1100);

    // 480 Swarm Drone Points with Morph Targets
    const droneCount = 480;
    const droneGeo = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(droneCount * 3);
    const spherePositions = new Float32Array(droneCount * 3);
    const tfPositions = new Float32Array(droneCount * 3);
    const falconPositions = new Float32Array(droneCount * 3);
    const helixPositions = new Float32Array(droneCount * 3);

    // 1) Sphere Formation (Pokéball)
    for (let i = 0; i < droneCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / droneCount);
      const theta = Math.sqrt(droneCount * Math.PI) * phi;
      const r = 95;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      spherePositions[i * 3] = x;
      spherePositions[i * 3 + 1] = y;
      spherePositions[i * 3 + 2] = z;

      currentPositions[i * 3] = x;
      currentPositions[i * 3 + 1] = y;
      currentPositions[i * 3 + 2] = z;
    }

    // 2) TF Emblem Formation
    for (let i = 0; i < droneCount; i++) {
      const t = i / droneCount;
      if (t < 0.5) {
        // T bar & stem
        const sub = t / 0.5;
        if (sub < 0.4) {
          tfPositions[i * 3] = (sub / 0.4 - 0.5) * 120 - 40;
          tfPositions[i * 3 + 1] = 60;
          tfPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        } else {
          tfPositions[i * 3] = -40;
          tfPositions[i * 3 + 1] = 60 - ((sub - 0.4) / 0.6) * 120;
          tfPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
      } else {
        // F bar & stem
        const sub = (t - 0.5) / 0.5;
        if (sub < 0.4) {
          tfPositions[i * 3] = (sub / 0.4) * 60 + 20;
          tfPositions[i * 3 + 1] = 60;
          tfPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        } else if (sub < 0.7) {
          tfPositions[i * 3] = 20;
          tfPositions[i * 3 + 1] = 60 - ((sub - 0.4) / 0.3) * 120;
          tfPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        } else {
          tfPositions[i * 3] = ((sub - 0.7) / 0.3) * 45 + 20;
          tfPositions[i * 3 + 1] = 10;
          tfPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
      }
    }

    // 3) Falcon Formation (V Wing Swarm)
    for (let i = 0; i < droneCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const progress = (i / droneCount);
      const span = progress * 140;
      falconPositions[i * 3] = side * span;
      falconPositions[i * 3 + 1] = Math.sin(progress * Math.PI) * 50 - progress * 40;
      falconPositions[i * 3 + 2] = -progress * 70;
    }

    // 4) Quantum Double Helix Formation
    for (let i = 0; i < droneCount; i++) {
      const angle = (i / droneCount) * Math.PI * 8;
      const strand = i % 2 === 0 ? 0 : Math.PI;
      const y = (i / droneCount - 0.5) * 180;
      helixPositions[i * 3] = Math.cos(angle + strand) * 65;
      helixPositions[i * 3 + 1] = y;
      helixPositions[i * 3 + 2] = Math.sin(angle + strand) * 65;
    }

    droneGeo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    const droneMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3.5,
      transparent: true,
      opacity: 0.95
    });

    const droneSwarmMesh = new THREE.Points(droneGeo, droneMat);
    realm3Group.add(droneSwarmMesh);
    objectsRef.current.droneSwarmMesh = droneSwarmMesh;
    objectsRef.current.morphTargets = {
      sphere: spherePositions,
      tf: tfPositions,
      falcon: falconPositions,
      helix: helixPositions
    };

    // Outer Geodesic Icosahedron Ring
    const sphereWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(100, 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35 })
    );
    realm3Group.add(sphereWire);
    objectsRef.current.sphereWire = sphereWire;

    // Drone Board
    const droneTex = textureLoader.load('/manga_drone_sphere.png');
    const droneBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 70),
      new THREE.MeshBasicMaterial({ map: droneTex, side: THREE.DoubleSide })
    );
    droneBoard.position.set(0, -90, 40);
    realm3Group.add(droneBoard);

    scene.add(realm3Group);
    objectsRef.current.realm3 = realm3Group;

    // =========================================================================
    // 5. REALM 4: TECHNOHOLIX STAGE & INTERACTIVE MONOLITHS (Z: neg 1800)
    // =========================================================================
    const realm4Group = new THREE.Group();
    realm4Group.position.set(0, 0, -1800);

    // Monolith Columns
    const monoliths = [];
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const colGeo = new THREE.BoxGeometry(16, 130 + Math.abs(i) * 15, 16);
      const colMesh = new THREE.Mesh(colGeo, new THREE.MeshBasicMaterial({ color: 0x0a0a0a }));
      const colWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(colGeo),
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
      );
      colMesh.add(colWire);
      colMesh.position.set(i * 45, 10, 0);
      realm4Group.add(colMesh);
      monoliths.push(colMesh);
    }
    objectsRef.current.monoliths = monoliths;

    // Interactive Equalizer Bars
    const eqBars = [];
    const eqCount = 16;
    for (let i = 0; i < eqCount; i++) {
      const barGeo = new THREE.BoxGeometry(8, 20, 8);
      const bar = new THREE.Mesh(
        barGeo,
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
      );
      bar.position.set((i - eqCount / 2) * 14, -50, 20);
      realm4Group.add(bar);
      eqBars.push(bar);
    }
    objectsRef.current.eqBars = eqBars;

    // Stage Board
    const stageTex = textureLoader.load('/manga_stage.png');
    const stageBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 105),
      new THREE.MeshBasicMaterial({ map: stageTex, side: THREE.DoubleSide })
    );
    stageBoard.position.set(0, 25, -20);
    realm4Group.add(stageBoard);

    scene.add(realm4Group);
    objectsRef.current.realm4 = realm4Group;

    // =========================================================================
    // RESIZE & DRAG HANDLERS
    // =========================================================================
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;

      if (cameraModeRef.current === 'orbit' || cameraModeRef.current === 'fpv') {
        camera.rotation.y -= dx * 0.005;
        camera.rotation.x -= dy * 0.005;
      } else {
        if (objectsRef.current.droneSwarmMesh) {
          objectsRef.current.droneSwarmMesh.rotation.y += dx * 0.008;
          objectsRef.current.droneSwarmMesh.rotation.x += dy * 0.008;
        }
      }
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => { isDraggingRef.current = false; };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // =========================================================================
    // ANIMATION LOOP (Delta Timed & Smooth 60/120fps)
    // =========================================================================
    let animationFrameId;
    const clock = new THREE.Clock();
    let elapsedTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsedTime += dt;
      const factor = 1.0 - Math.exp(-9.0 * dt);

      // Gate ring rotation
      if (objectsRef.current.ring1) {
        objectsRef.current.ring1.rotation.z += 1.0 * dt;
      }

      // Goal beacon rotation
      if (objectsRef.current.goalMesh) {
        objectsRef.current.goalMesh.rotation.y += 2.5 * dt;
        objectsRef.current.goalMesh.rotation.x += 1.2 * dt;
      }

      // Playable Rover Physics & Controls
      if (objectsRef.current.bot) {
        const bot = objectsRef.current.bot;
        const ctrl = botControlRef.current;

        if (ctrl && ctrl.active) {
          // Manual WASD / joystick steering
          bot.position.x += ctrl.x * 120 * dt;
          bot.position.z += ctrl.z * 120 * dt;
          if (ctrl.x !== 0 || ctrl.z !== 0) {
            bot.rotation.y = Math.atan2(ctrl.x, ctrl.z);
          }

          // Goal collision detection
          const distToGoal = Math.hypot(bot.position.x - 70, bot.position.z - (-70));
          if (distToGoal < 22 && onBotGoalRef.current) {
            onBotGoalRef.current();
          }
        } else {
          // Autonomous LiDAR patrol
          bot.position.x = Math.sin(elapsedTime * 1.5) * 45;
          bot.position.z = Math.cos(elapsedTime * 1.5) * 35;
          bot.rotation.y = elapsedTime * 1.5 + Math.PI / 2;
        }

        if (objectsRef.current.lidar) objectsRef.current.lidar.rotation.y += 5.0 * dt;
        if (objectsRef.current.radar) {
          const s = 1.0 + Math.sin(elapsedTime * 6) * 0.35;
          objectsRef.current.radar.scale.set(s, s, 1);
        }
      }

      // Drone Swarm Interpolation towards active formation
      if (objectsRef.current.droneSwarmMesh && objectsRef.current.morphTargets) {
        const positions = objectsRef.current.droneSwarmMesh.geometry.attributes.position.array;
        const targetFormation = objectsRef.current.morphTargets[droneFormationRef.current] || objectsRef.current.morphTargets.sphere;
        const droneLerp = 1.0 - Math.exp(-4.5 * dt);

        for (let i = 0; i < positions.length; i++) {
          positions[i] += (targetFormation[i] - positions[i]) * droneLerp;
        }
        objectsRef.current.droneSwarmMesh.geometry.attributes.position.needsUpdate = true;

        if (!isDraggingRef.current) {
          objectsRef.current.droneSwarmMesh.rotation.y += 0.25 * dt;
        }

        if (objectsRef.current.sphereWire && !isDraggingRef.current) {
          objectsRef.current.sphereWire.rotation.y += 0.15 * dt;
        }
      }

      // DJ Equalizer & Monoliths reacting to beats
      if (objectsRef.current.eqBars) {
        const beatBoost = djBeatRef.current ? 2.5 : 1.0;
        objectsRef.current.eqBars.forEach((bar, idx) => {
          const h = (10 + Math.abs(Math.sin(elapsedTime * 6 + idx * 0.6)) * 40) * beatBoost;
          bar.scale.y = h / 20;
          bar.position.y = -50 + h / 2;
        });

        if (objectsRef.current.monoliths) {
          objectsRef.current.monoliths.forEach((m, idx) => {
            const scaleY = 1.0 + (djBeatRef.current ? 0.35 : 0) + Math.sin(elapsedTime * 4 + idx) * 0.08;
            m.scale.y = scaleY;
          });
        }
      }

      // Selective Realm Visibility: eliminates inter chapter visual bleed
      const camZ = camera.position.z;
      if (objectsRef.current.realm1) objectsRef.current.realm1.visible = camZ > 0;
      if (objectsRef.current.realm2) objectsRef.current.realm2.visible = camZ < 250 && camZ > -750;
      if (objectsRef.current.realm3) objectsRef.current.realm3.visible = camZ < -450 && camZ > -1450;
      if (objectsRef.current.realm4) objectsRef.current.realm4.visible = camZ < -1100;

      // CAMERA MODES
      const mode = cameraModeRef.current;
      if (mode === 'cockpit' && objectsRef.current.bot) {
        // Cockpit view inside the rover looking forward
        const bot = objectsRef.current.bot;
        const forwardX = Math.sin(bot.rotation.y);
        const forwardZ = Math.cos(bot.rotation.y);
        camera.position.set(bot.position.x, -35, -500 + bot.position.z);
        camera.lookAt(bot.position.x + forwardX * 100, -35, -500 + bot.position.z + forwardZ * 100);
      } else if (mode === 'fpv') {
        // FPV Free Flight (mouse drag pitches/yaws)
        camera.position.z -= 75 * dt;
        if (camera.position.z < -2000) camera.position.z = 300;
      } else if (mode === 'orbit') {
        // 360 Orbit around active center
        const radius = 500;
        const angle = elapsedTime * 0.25;
        camera.position.x = Math.sin(angle) * radius;
        camera.position.z = -700 + Math.cos(angle) * radius;
        camera.position.y = 80;
        camera.lookAt(0, -20, -700);
      } else {
        // Default scroll journey along Z axis
        const sp = scrollRef.current || 0;
        const targetZ = 400 - sp * 2200;
        const targetX = Math.sin(sp * Math.PI * 3) * 60;
        const targetY = Math.cos(sp * Math.PI * 2) * 30;

        const dz = targetZ - camera.position.z;
        camera.position.z += dz * factor;
        camera.position.x += (targetX - camera.position.x) * factor;
        camera.position.y += (targetY - camera.position.y) * factor;
        camera.lookAt(0, 0, camera.position.z - 200);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 0,
        touchAction: 'none',
        cursor: cameraMode === 'orbit' || cameraMode === 'fpv' ? 'crosshair' : 'grab'
      }} 
    />
  );
}
