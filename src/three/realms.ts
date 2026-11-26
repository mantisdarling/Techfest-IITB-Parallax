import * as THREE from 'three';
import type { SceneObjects } from './scene';
import { DRONE_COUNT, buildMorphTargets, spherePositions } from './formations';
import { BOT_START, GOAL_POSITION, MAZE_WALLS } from './maze';

function wireEdges(geo: THREE.BufferGeometry, color = 0xffffff): THREE.LineSegments {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color })
  );
}

function billboard(loader: THREE.TextureLoader, url: string, w: number, h: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: loader.load(url), side: THREE.DoubleSide })
  );
}

// REALM 1: THE GATEWAY & WALL MURAL (Z: 200)
export function buildGatewayRealm(
  scene: THREE.Scene,
  objects: SceneObjects,
  loader: THREE.TextureLoader
): void {
  const group = new THREE.Group();
  group.position.set(0, 0, 200);

  const mural = billboard(loader, '/manga_mural.png', 160, 160);
  mural.position.set(60, 10, 0);
  mural.rotation.y = -0.25;
  group.add(mural);

  const muralWire = wireEdges(new THREE.BoxGeometry(162, 162, 8));
  muralWire.position.copy(mural.position);
  muralWire.rotation.copy(mural.rotation);
  group.add(muralWire);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(85, 2.5, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
  );
  ring.position.set(-60, 0, -20);
  group.add(ring);

  scene.add(group);
  objects.realm1 = group;
  objects.ring1 = ring;
}

// REALM 2: MESHME RIZE / 30nm ROBOWARS ARENA (Z: -500)
export function buildRobowarsRealm(
  scene: THREE.Scene,
  objects: SceneObjects,
  loader: THREE.TextureLoader
): void {
  const group = new THREE.Group();
  group.position.set(0, 0, -500);

  const grid = new THREE.GridHelper(340, 24, 0xffffff, 0x444444);
  grid.position.set(0, -60, 0);
  group.add(grid);

  const walls = new THREE.Group();
  walls.position.set(0, -50, 0);
  MAZE_WALLS.forEach(([wx, wz, ww, wd]) => {
    const geo = new THREE.BoxGeometry(ww, 20, wd);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x111111 }));
    const wire = wireEdges(geo);
    mesh.position.set(wx, 0, wz);
    wire.position.set(wx, 0, wz);
    walls.add(mesh);
    walls.add(wire);
  });
  group.add(walls);

  const goal = new THREE.Mesh(
    new THREE.OctahedronGeometry(12, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
  );
  goal.position.set(GOAL_POSITION.x, -45, GOAL_POSITION.z);
  group.add(goal);

  const bot = new THREE.Group();
  bot.position.set(BOT_START.x, -48, BOT_START.z);

  const chassisGeo = new THREE.BoxGeometry(36, 18, 44);
  bot.add(new THREE.Mesh(chassisGeo, new THREE.MeshBasicMaterial({ color: 0x050505 })));
  bot.add(wireEdges(chassisGeo));

  for (const x of [-20, 20]) {
    for (const z of [-15, 15]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(8, 8, 5, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, -5, z);
      bot.add(wheel);
    }
  }

  const lidar = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 7, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
  );
  lidar.position.set(0, 13, 0);
  bot.add(lidar);

  const radar = new THREE.Mesh(
    new THREE.RingGeometry(12, 14, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  radar.rotation.x = -Math.PI / 2;
  radar.position.set(0, 14, 0);
  bot.add(radar);

  const botBoard = billboard(loader, '/manga_bot_maze.png', 130, 130);
  botBoard.position.set(-90, 25, -50);
  botBoard.rotation.y = 0.35;
  group.add(botBoard);

  group.add(bot);
  scene.add(group);
  objects.realm2 = group;
  objects.goalMesh = goal;
  objects.bot = bot;
  objects.lidar = lidar;
  objects.radar = radar;
}

// REALM 3: CELESTIAL DRONE SWARM (Z: -1100) WITH MORPHING FORMATIONS
export function buildDroneRealm(
  scene: THREE.Scene,
  objects: SceneObjects,
  loader: THREE.TextureLoader
): void {
  const group = new THREE.Group();
  group.position.set(0, 0, -1100);

  const morphTargets = buildMorphTargets(DRONE_COUNT);
  const currentPositions = spherePositions(DRONE_COUNT);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3.5,
    transparent: true,
    opacity: 0.95,
  });
  const swarm = new THREE.Points(geo, mat);
  group.add(swarm);

  const sphereWire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(100, 2),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
  );
  group.add(sphereWire);

  const droneBoard = billboard(loader, '/manga_drone_sphere.png', 160, 70);
  droneBoard.position.set(0, -90, 40);
  group.add(droneBoard);

  scene.add(group);
  objects.realm3 = group;
  objects.droneSwarmMesh = swarm;
  objects.morphTargets = morphTargets;
  objects.sphereWire = sphereWire;
}

// REALM 4: TECHNOHOLIX STAGE & INTERACTIVE MONOLITHS (Z: -1800)
export function buildStageRealm(
  scene: THREE.Scene,
  objects: SceneObjects,
  loader: THREE.TextureLoader
): void {
  const group = new THREE.Group();
  group.position.set(0, 0, -1800);

  const monoliths: THREE.Mesh[] = [];
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const geo = new THREE.BoxGeometry(16, 130 + Math.abs(i) * 15, 16);
    const col = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x0a0a0a }));
    col.add(wireEdges(geo));
    col.position.set(i * 45, 10, 0);
    group.add(col);
    monoliths.push(col);
  }

  const eqBars: THREE.Mesh[] = [];
  const eqCount = 16;
  for (let i = 0; i < eqCount; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(8, 20, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    );
    bar.position.set((i - eqCount / 2) * 14, -50, 20);
    group.add(bar);
    eqBars.push(bar);
  }

  const stageBoard = billboard(loader, '/manga_stage.png', 180, 105);
  stageBoard.position.set(0, 25, -20);
  group.add(stageBoard);

  scene.add(group);
  objects.realm4 = group;
  objects.monoliths = monoliths;
  objects.eqBars = eqBars;
}
