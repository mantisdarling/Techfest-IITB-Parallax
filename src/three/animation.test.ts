import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { updateWorld, type WorldState } from './animation';
import type { SceneObjects } from './scene';

const state: WorldState = {
  scrollProgress: 0,
  cameraMode: 'scroll',
  droneFormation: 'sphere',
  djBeat: false,
  botControl: { x: 0, z: 0, active: false },
  isDragging: false,
};

describe('updateWorld', () => {
  it('does not animate realms outside the current camera range', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.z = 400;
    const positions = new Float32Array([0, 0, 0]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const swarm = new THREE.Points(geometry, new THREE.PointsMaterial());
    const target = new Float32Array([10, 10, 10]);
    const objects: SceneObjects = {
      realm1: new THREE.Group(),
      realm2: new THREE.Group(),
      realm3: new THREE.Group(),
      realm4: new THREE.Group(),
      droneSwarmMesh: swarm,
      morphTargets: { sphere: target, tf: target, falcon: target, helix: target },
    };

    updateWorld(objects, camera, state, 1 / 60, 1);

    expect(Array.from(positions)).toEqual([0, 0, 0]);
    expect(objects.realm3?.visible).toBe(false);
    geometry.dispose();
    (swarm.material as THREE.Material).dispose();
  });
});
