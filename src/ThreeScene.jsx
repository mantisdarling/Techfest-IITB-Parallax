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
    // Fog starts at 200 units, completely blacks out at 680 units
    scene.fog = new THREE.Fog(0x000000, 200, 680);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1600);
    camera.position.set(0, 10, 400);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const textureLoader = new THREE.TextureLoader();

    // =========================================================================
    // 1. MANGA SCREENTONE PARTICLES (Starry Ink Cosmos)
    // =========================================================================
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 1600;
      particlePositions[i + 1] = (Math.random() - 0.5) * 1600;
      particlePositions[i + 2] = (Math.random() - 0.5) * 2800 - 800;
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
    // 2. REALM 1: THE GATEWAY & WALL MURAL (Z: 180, Camera views from Z: 400)
    // =========================================================================
    const realm1Group = new THREE.Group();
    realm1Group.position.set(0, 0, 180);

    const muralTex = textureLoader.load('/manga_mural.png');
    const muralMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 150),
      new THREE.MeshBasicMaterial({ map: muralTex, side: THREE.DoubleSide })
    );
    muralMesh.position.set(65, 12, 0);
    muralMesh.rotation.y = -0.25;
    realm1Group.add(muralMesh);

    const muralBoxWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(152, 152, 6)),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    muralBoxWire.position.copy(muralMesh.position);
    muralBoxWire.rotation.copy(muralMesh.rotation);
    realm1Group.add(muralBoxWire);

    // Rotating Torus Gate
    const ringGeo = new THREE.TorusGeometry(80, 2.2, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.set(-50, 0, -25);
    realm1Group.add(ring1);
    objectsRef.current.ring1 = ring1;

    scene.add(realm1Group);
    objectsRef.current.realm1 = realm1Group;

    // =========================================================================
    // 3. REALM 2: MESHME RIZE / 30nm ROBOWARS ARENA (Z: -550, Camera views from Z: -330)
    // =========================================================================
    const realm2Group = new THREE.Group();
    realm2Group.position.set(0, 0, -550);

    // Arena Base Platform (centered on the left at X = -50, clean view unobstructed by right card)
    const arenaCenterX = -50;
    const arenaCenterZ = 0;
    const arenaY = -48;

    const floorGeo = new THREE.BoxGeometry(140, 4, 140);
    const floorMesh = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ color: 0x050505 }));
    floorMesh.position.set(arenaCenterX, arenaY - 2, arenaCenterZ);
    const floorWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(floorGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    floorMesh.add(floorWire);
    realm2Group.add(floorMesh);

    // Circuit Grid Floor overlay
    const circuitGrid = new THREE.GridHelper(140, 14, 0xffffff, 0x222222);
    circuitGrid.position.set(arenaCenterX, arenaY + 0.1, arenaCenterZ);
    realm2Group.add(circuitGrid);

    // Manga Maze Corridors (low perimeter curb + crisp interior partition walls)
    // Interior wall height: 8 units, perimeter: 4 units - does NOT clip or block camera
    const mazeWallsGroup = new THREE.Group();

    const mazeWallData = [
      // Outer boundaries (low curb, height 4)
      { x: arenaCenterX, z: arenaCenterZ - 68, w: 136, d: 3, h: 4 }, // North
      { x: arenaCenterX, z: arenaCenterZ + 68, w: 136, d: 3, h: 4 }, // South
      { x: arenaCenterX - 68, z: arenaCenterZ, w: 3, d: 136, h: 4 }, // West
      { x: arenaCenterX + 68, z: arenaCenterZ, w: 3, d: 136, h: 4 }, // East
      // Interior labyrinth corridors (height 8)
      { x: arenaCenterX - 30, z: arenaCenterZ - 15, w: 3.5, d: 65, h: 8 },
      { x: arenaCenterX + 15, z: arenaCenterZ + 15, w: 3.5, d: 65, h: 8 },
      { x: arenaCenterX - 5, z: arenaCenterZ - 10, w: 55, d: 3.5, h: 8 },
      { x: arenaCenterX - 30, z: arenaCenterZ + 30, w: 40, d: 3.5, h: 8 },
      { x: arenaCenterX + 35, z: arenaCenterZ - 30, w: 40, d: 3.5, h: 8 },
    ];

    mazeWallData.forEach(w => {
      const wGeo = new THREE.BoxGeometry(w.w, w.h, w.d);
      const wMesh = new THREE.Mesh(wGeo, new THREE.MeshBasicMaterial({ color: 0x090909 }));
      const wWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(wGeo),
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5 })
      );
      wMesh.position.set(w.x, arenaY + w.h / 2, w.z);
      wWire.position.set(w.x, arenaY + w.h / 2, w.z);
      mazeWallsGroup.add(wMesh);
      mazeWallsGroup.add(wWire);
    });
    realm2Group.add(mazeWallsGroup);

    // Goal Checkpoint Terminal (Elevated spinning crystal with ground target ring)
    const goalX = arenaCenterX + 40;
    const goalZ = arenaCenterZ - 40;
    const goalGroup = new THREE.Group();
    goalGroup.position.set(goalX, arenaY + 10, goalZ);

    const goalGeo = new THREE.OctahedronGeometry(8, 0);
    const goalMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const goalMesh = new THREE.Mesh(goalGeo, goalMat);
    goalGroup.add(goalMesh);

    const goalRingGeo = new THREE.RingGeometry(10, 12, 24);
    const goalRing = new THREE.Mesh(goalRingGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    goalRing.rotation.x = -Math.PI / 2;
    goalRing.position.y = -9.5;
    goalGroup.add(goalRing);

    realm2Group.add(goalGroup);
    objectsRef.current.goalMesh = goalMesh;

    // 3D Playable / Autonomous Nanotech Rover
    const botGroup = new THREE.Group();
    const botStartX = arenaCenterX - 35;
    const botStartZ = arenaCenterZ + 35;
    botGroup.position.set(botStartX, arenaY + 4, botStartZ);

    // Sleek Angular Mecha Chassis
    const chassisGeo = new THREE.BoxGeometry(16, 6, 22);
    const chassisMesh = new THREE.Mesh(chassisGeo, new THREE.MeshBasicMaterial({ color: 0x070707 }));
    const chassisWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(chassisGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    chassisMesh.add(chassisWire);
    botGroup.add(chassisMesh);

    // 4 Rover Wheels with Wireframes
    const wheels = [];
    for (let wx of [-9.5, 9.5]) {
      for (let wz of [-7, 7]) {
        const wheelGeo = new THREE.CylinderGeometry(4, 4, 3, 12);
        const wheel = new THREE.Mesh(wheelGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, -1.8, wz);
        botGroup.add(wheel);
        wheels.push(wheel);
      }
    }
    objectsRef.current.wheels = wheels;

    // Headlight Beams (Glowing white cone spotlights forward)
    const headlightGeo = new THREE.ConeGeometry(4.5, 16, 8, 1, true);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.3 });
    const headlightL = new THREE.Mesh(headlightGeo, headlightMat);
    headlightL.rotation.x = -Math.PI / 2;
    headlightL.position.set(-4.5, 0, 15);
    const headlightR = new THREE.Mesh(headlightGeo, headlightMat);
    headlightR.rotation.x = -Math.PI / 2;
    headlightR.position.set(4.5, 0, 15);
    botGroup.add(headlightL);
    botGroup.add(headlightR);

    // Rotating LiDAR Dome
    const lidarGeo = new THREE.CylinderGeometry(3, 3, 4, 8);
    const lidar = new THREE.Mesh(lidarGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
    lidar.position.set(0, 5, -2);
    botGroup.add(lidar);
    objectsRef.current.lidar = lidar;

    realm2Group.add(botGroup);
    objectsRef.current.bot = botGroup;
    objectsRef.current.arenaBounds = {
      minX: arenaCenterX - 62,
      maxX: arenaCenterX + 62,
      minZ: arenaCenterZ - 62,
      maxZ: arenaCenterZ + 62,
      goalX,
      goalZ
    };

    // Mission Tactical Blueprint Backdrop (Framed upright behind the maze, non-intrusive)
    const botTex = textureLoader.load('/manga_bot_maze.png');
    const botBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(125, 80),
      new THREE.MeshBasicMaterial({ map: botTex, side: THREE.DoubleSide })
    );
    botBoard.position.set(arenaCenterX, arenaY + 44, arenaCenterZ - 75);
    const botBoardFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(127, 82, 3)),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    botBoard.add(botBoardFrame);
    realm2Group.add(botBoard);

    scene.add(realm2Group);
    objectsRef.current.realm2 = realm2Group;

    // =========================================================================
    // 4. REALM 3: CELESTIAL DRONE SWARM (Z: -1360, Camera views from Z: -1100)
    // =========================================================================
    const realm3Group = new THREE.Group();
    realm3Group.position.set(38, 0, -1360);

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
      const r = 74;
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
        const sub = t / 0.5;
        if (sub < 0.4) {
          tfPositions[i * 3] = (sub / 0.4 - 0.5) * 95 - 30;
          tfPositions[i * 3 + 1] = 45;
          tfPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        } else {
          tfPositions[i * 3] = -30;
          tfPositions[i * 3 + 1] = 45 - ((sub - 0.4) / 0.6) * 90;
          tfPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
      } else {
        const sub = (t - 0.5) / 0.5;
        if (sub < 0.4) {
          tfPositions[i * 3] = (sub / 0.4) * 45 + 18;
          tfPositions[i * 3 + 1] = 45;
          tfPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        } else if (sub < 0.7) {
          tfPositions[i * 3] = 18;
          tfPositions[i * 3 + 1] = 45 - ((sub - 0.4) / 0.3) * 90;
          tfPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        } else {
          tfPositions[i * 3] = ((sub - 0.7) / 0.3) * 32 + 18;
          tfPositions[i * 3 + 1] = 8;
          tfPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
      }
    }

    // 3) Falcon Formation (V Wing Swarm)
    for (let i = 0; i < droneCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const progress = (i / droneCount);
      const span = progress * 110;
      falconPositions[i * 3] = side * span;
      falconPositions[i * 3 + 1] = Math.sin(progress * Math.PI) * 40 - progress * 30;
      falconPositions[i * 3 + 2] = -progress * 50;
    }

    // 4) Quantum Double Helix Formation
    for (let i = 0; i < droneCount; i++) {
      const angle = (i / droneCount) * Math.PI * 8;
      const strand = i % 2 === 0 ? 0 : Math.PI;
      const y = (i / droneCount - 0.5) * 135;
      helixPositions[i * 3] = Math.cos(angle + strand) * 48;
      helixPositions[i * 3 + 1] = y;
      helixPositions[i * 3 + 2] = Math.sin(angle + strand) * 48;
    }

    droneGeo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    const droneMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3.0,
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

    // Outer Geodesic Sphere
    const sphereWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(80, 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35 })
    );
    realm3Group.add(sphereWire);
    objectsRef.current.sphereWire = sphereWire;

    // Drone Board (Framed cleanly below the swarm)
    const droneTex = textureLoader.load('/manga_drone_sphere.png');
    const droneBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(125, 52),
      new THREE.MeshBasicMaterial({ map: droneTex, side: THREE.DoubleSide })
    );
    droneBoard.position.set(0, -68, -25);
    const droneBoardWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(127, 54, 3)),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5 })
    );
    droneBoard.add(droneBoardWire);
    realm3Group.add(droneBoard);

    scene.add(realm3Group);
    objectsRef.current.realm3 = realm3Group;

    // =========================================================================
    // 5. REALM 4: TECHNOHOLIX STAGE & INTERACTIVE MONOLITHS (Z: -2020, Camera views from Z: -1800)
    // =========================================================================
    const realm4Group = new THREE.Group();
    realm4Group.position.set(-35, 0, -2020);

    // Stage Deck Platform
    const stageDeckGeo = new THREE.BoxGeometry(160, 4, 90);
    const stageDeck = new THREE.Mesh(stageDeckGeo, new THREE.MeshBasicMaterial({ color: 0x060606 }));
    stageDeck.position.set(0, -48, 0);
    const stageDeckWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(stageDeckGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    stageDeck.add(stageDeckWire);
    realm4Group.add(stageDeck);

    // Monolith Columns
    const monoliths = [];
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const colGeo = new THREE.BoxGeometry(14, 95 + Math.abs(i) * 12, 14);
      const colMesh = new THREE.Mesh(colGeo, new THREE.MeshBasicMaterial({ color: 0x080808 }));
      const colWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(colGeo),
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5 })
      );
      colMesh.add(colWire);
      colMesh.position.set(i * 32, 0, -25);
      realm4Group.add(colMesh);
      monoliths.push(colMesh);
    }
    objectsRef.current.monoliths = monoliths;

    // Interactive Equalizer Bars
    const eqBars = [];
    const eqCount = 14;
    for (let i = 0; i < eqCount; i++) {
      const barGeo = new THREE.BoxGeometry(7, 20, 7);
      const bar = new THREE.Mesh(
        barGeo,
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
      );
      bar.position.set((i - eqCount / 2) * 11, -45, 20);
      realm4Group.add(bar);
      eqBars.push(bar);
    }
    objectsRef.current.eqBars = eqBars;

    // Stage Board (Framed cleanly as mainstage screen)
    const stageTex = textureLoader.load('/manga_stage.png');
    const stageBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 85),
      new THREE.MeshBasicMaterial({ map: stageTex, side: THREE.DoubleSide })
    );
    stageBoard.position.set(0, 18, -35);
    const stageBoardWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(152, 87, 3)),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    stageBoard.add(stageBoardWire);
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
    // ANIMATION LOOP (Delta-Timed & Smooth 60/120fps)
    // =========================================================================
    let animationFrameId;
    const clock = new THREE.Clock();
    let elapsedTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsedTime += dt;
      const lerpFactor = 1.0 - Math.exp(-6.0 * dt);

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
        const bounds = objectsRef.current.arenaBounds;

        if (ctrl && ctrl.active) {
          // Responsive manual WASD / Directional Pad driving
          const moveSpeed = 85 * dt;
          bot.position.x += ctrl.x * moveSpeed;
          bot.position.z += ctrl.z * moveSpeed;

          // Clamp rover within arena boundary walls
          if (bounds) {
            bot.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, bot.position.x));
            bot.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, bot.position.z));
          }

          if (ctrl.x !== 0 || ctrl.z !== 0) {
            const targetRot = Math.atan2(ctrl.x, ctrl.z);
            bot.rotation.y = THREE.MathUtils.lerp(bot.rotation.y, targetRot, 0.25);
          }

          // Spin wheels while driving
          if (objectsRef.current.wheels) {
            objectsRef.current.wheels.forEach(w => {
              w.rotation.x += 12 * dt;
            });
          }

          // Goal collision detection
          if (bounds) {
            const distToGoal = Math.hypot(bot.position.x - bounds.goalX, bot.position.z - bounds.goalZ);
            if (distToGoal < 20 && onBotGoalRef.current) {
              onBotGoalRef.current();
            }
          }
        } else {
          // Autonomous patrol mode when not actively driven
          bot.position.x = arenaCenterX + Math.sin(elapsedTime * 1.2) * 28;
          bot.position.z = arenaCenterZ + Math.cos(elapsedTime * 1.2) * 24;
          bot.rotation.y = elapsedTime * 1.2 + Math.PI / 2;
        }

        if (objectsRef.current.lidar) {
          objectsRef.current.lidar.rotation.y += 5.0 * dt;
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
      }

      // DJ Equalizer & Monoliths reacting to beats
      if (objectsRef.current.eqBars) {
        const beatBoost = djBeatRef.current ? 2.5 : 1.0;
        objectsRef.current.eqBars.forEach((bar, idx) => {
          const h = (10 + Math.abs(Math.sin(elapsedTime * 6 + idx * 0.6)) * 40) * beatBoost;
          bar.scale.y = h / 20;
          bar.position.y = -45 + h / 2;
        });

        if (objectsRef.current.monoliths) {
          objectsRef.current.monoliths.forEach((m, idx) => {
            const scaleY = 1.0 + (djBeatRef.current ? 0.35 : 0) + Math.sin(elapsedTime * 4 + idx) * 0.08;
            m.scale.y = scaleY;
          });
        }
      }

      // SELECTIVE REALM VISIBILITY:
      // Completely shuts down visual bleed / overlap between chapters
      const camZ = camera.position.z;
      if (objectsRef.current.realm1) objectsRef.current.realm1.visible = camZ > -100;
      if (objectsRef.current.realm2) objectsRef.current.realm2.visible = camZ < 50 && camZ > -850;
      if (objectsRef.current.realm3) objectsRef.current.realm3.visible = camZ < -700 && camZ > -1550;
      if (objectsRef.current.realm4) objectsRef.current.realm4.visible = camZ < -1450;

      // CAMERA MODES
      const mode = cameraModeRef.current;
      if (mode === 'cockpit' && objectsRef.current.bot) {
        // Cockpit view inside the rover looking forward
        const bot = objectsRef.current.bot;
        const forwardX = Math.sin(bot.rotation.y);
        const forwardZ = Math.cos(bot.rotation.y);
        camera.position.set(bot.position.x, bot.position.y + 4, -550 + bot.position.z);
        camera.lookAt(bot.position.x + forwardX * 100, bot.position.y + 2, -550 + bot.position.z + forwardZ * 100);
      } else if (mode === 'fpv') {
        // FPV Free Flight
        camera.position.z -= 75 * dt;
        if (camera.position.z < -2200) camera.position.z = 300;
      } else if (mode === 'orbit') {
        // 360 Orbit around active center
        const radius = 450;
        const angle = elapsedTime * 0.25;
        camera.position.x = Math.sin(angle) * radius;
        camera.position.z = -700 + Math.cos(angle) * radius;
        camera.position.y = 80;
        camera.lookAt(0, -20, -700);
      } else {
        // Default smooth scroll journey with cinematic framing for each chapter
        const sp = scrollRef.current || 0;
        const targetZ = 400 - sp * 2200;

        let targetX = 0;
        let targetY = 12;
        let lookTargetX = 0;
        let lookTargetY = 0;

        if (sp < 0.25) {
          // Chapter 1: Gateway Mural (Subject right, card left)
          targetX = -18;
          targetY = 14;
          lookTargetX = 45;
          lookTargetY = 8;
        } else if (sp < 0.52) {
          // Chapter 2: Robowars Maze Arena (Elevated 3/4 isometric view on the left, card on right)
          targetX = 18;
          targetY = 32;
          lookTargetX = arenaCenterX;
          lookTargetY = arenaY + 10;
        } else if (sp < 0.75) {
          // Chapter 3: Drone Swarm (Subject right/center, card left)
          targetX = -25;
          targetY = 8;
          lookTargetX = 38;
          lookTargetY = 0;
        } else {
          // Chapter 4: Technoholix Megastage (Subject left/center, card right)
          targetX = 22;
          targetY = 16;
          lookTargetX = -35;
          lookTargetY = 0;
        }

        camera.position.z += (targetZ - camera.position.z) * lerpFactor;
        camera.position.x += (targetX - camera.position.x) * lerpFactor;
        camera.position.y += (targetY - camera.position.y) * lerpFactor;
        camera.lookAt(lookTargetX, lookTargetY, camera.position.z - 220);
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
