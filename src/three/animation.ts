import * as THREE from 'three';
import type { BotControl, CameraMode, DroneFormation } from '../types';
import type { SceneObjects } from './scene';
import { BOT_SPEED, isGoalReached } from './maze';
import {
  FPV_MIN_Z,
  FPV_RESET_Z,
  FPV_SPEED,
  ORBIT_CENTER_Z,
  ORBIT_RADIUS,
  realmVisibility,
  scrollCameraTarget,
} from './cameraPath';

export interface WorldState {
  scrollProgress: number;
  cameraMode: CameraMode;
  droneFormation: DroneFormation;
  djBeat: boolean;
  botControl: BotControl | null;
  isDragging: boolean;
}

export function updateWorld(
  objects: SceneObjects,
  camera: THREE.PerspectiveCamera,
  state: WorldState,
  dt: number,
  elapsedTime: number,
  onBotGoal?: () => void
): void {
  const factor = 1.0 - Math.exp(-9.0 * dt);
  const visibility = realmVisibility(camera.position.z);

  if (visibility.realm1 && objects.ring1) {
    objects.ring1.rotation.z += 1.0 * dt;
  }

  if (visibility.realm2 && objects.goalMesh) {
    objects.goalMesh.rotation.y += 2.5 * dt;
    objects.goalMesh.rotation.x += 1.2 * dt;
  }

  if (visibility.realm2) updateRover(objects, state, dt, elapsedTime, onBotGoal);
  if (visibility.realm3) updateDroneSwarm(objects, state, dt);
  if (visibility.realm4) updateStage(objects, state, elapsedTime);

  if (objects.realm1) objects.realm1.visible = visibility.realm1;
  if (objects.realm2) objects.realm2.visible = visibility.realm2;
  if (objects.realm3) objects.realm3.visible = visibility.realm3;
  if (objects.realm4) objects.realm4.visible = visibility.realm4;

  updateCamera(objects, camera, state, dt, elapsedTime, factor);
}

function updateRover(
  objects: SceneObjects,
  state: WorldState,
  dt: number,
  elapsedTime: number,
  onBotGoal?: () => void
): void {
  const bot = objects.bot;
  if (!bot) return;
  const ctrl = state.botControl;

  if (ctrl && ctrl.active) {
    bot.position.x += ctrl.x * BOT_SPEED * dt;
    bot.position.z += ctrl.z * BOT_SPEED * dt;
    if (ctrl.x !== 0 || ctrl.z !== 0) {
      bot.rotation.y = Math.atan2(ctrl.x, ctrl.z);
    }
    if (isGoalReached(bot.position.x, bot.position.z) && onBotGoal) {
      onBotGoal();
    }
  } else {
    // Autonomous LiDAR patrol
    bot.position.x = Math.sin(elapsedTime * 1.5) * 45;
    bot.position.z = Math.cos(elapsedTime * 1.5) * 35;
    bot.rotation.y = elapsedTime * 1.5 + Math.PI / 2;
  }

  if (objects.lidar) objects.lidar.rotation.y += 5.0 * dt;
  if (objects.radar) {
    const s = 1.0 + Math.sin(elapsedTime * 6) * 0.35;
    objects.radar.scale.set(s, s, 1);
  }
}

function updateDroneSwarm(objects: SceneObjects, state: WorldState, dt: number): void {
  const swarm = objects.droneSwarmMesh;
  if (!swarm || !objects.morphTargets) return;

  const attr = swarm.geometry.attributes.position as THREE.BufferAttribute;
  const positions = attr.array as Float32Array;
  const target = objects.morphTargets[state.droneFormation] || objects.morphTargets.sphere;
  const droneLerp = 1.0 - Math.exp(-4.5 * dt);

  for (let i = 0; i < positions.length; i++) {
    positions[i] += (target[i] - positions[i]) * droneLerp;
  }
  attr.needsUpdate = true;

  if (!state.isDragging) {
    swarm.rotation.y += 0.25 * dt;
    if (objects.sphereWire) objects.sphereWire.rotation.y += 0.15 * dt;
  }
}

function updateStage(objects: SceneObjects, state: WorldState, elapsedTime: number): void {
  if (!objects.eqBars) return;
  const beatBoost = state.djBeat ? 2.5 : 1.0;
  objects.eqBars.forEach((bar, idx) => {
    const h = (10 + Math.abs(Math.sin(elapsedTime * 6 + idx * 0.6)) * 40) * beatBoost;
    bar.scale.y = h / 20;
    bar.position.y = -50 + h / 2;
  });

  objects.monoliths?.forEach((m, idx) => {
    m.scale.y = 1.0 + (state.djBeat ? 0.35 : 0) + Math.sin(elapsedTime * 4 + idx) * 0.08;
  });
}

function updateCamera(
  objects: SceneObjects,
  camera: THREE.PerspectiveCamera,
  state: WorldState,
  dt: number,
  elapsedTime: number,
  factor: number
): void {
  const mode = state.cameraMode;
  if (mode === 'cockpit' && objects.bot) {
    const bot = objects.bot;
    const forwardX = Math.sin(bot.rotation.y);
    const forwardZ = Math.cos(bot.rotation.y);
    camera.position.set(bot.position.x, -35, -500 + bot.position.z);
    camera.lookAt(bot.position.x + forwardX * 100, -35, -500 + bot.position.z + forwardZ * 100);
  } else if (mode === 'fpv') {
    camera.position.z -= FPV_SPEED * dt;
    if (camera.position.z < FPV_MIN_Z) camera.position.z = FPV_RESET_Z;
  } else if (mode === 'orbit') {
    const angle = elapsedTime * 0.25;
    camera.position.x = Math.sin(angle) * ORBIT_RADIUS;
    camera.position.z = ORBIT_CENTER_Z + Math.cos(angle) * ORBIT_RADIUS;
    camera.position.y = 80;
    camera.lookAt(0, -20, ORBIT_CENTER_Z);
  } else {
    const target = scrollCameraTarget(state.scrollProgress || 0);
    camera.position.z += (target.z - camera.position.z) * factor;
    camera.position.x += (target.x - camera.position.x) * factor;
    camera.position.y += (target.y - camera.position.y) * factor;
    camera.lookAt(0, 0, camera.position.z - 200);
  }
}
