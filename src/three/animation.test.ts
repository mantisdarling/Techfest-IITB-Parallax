import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
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

  it('snaps formations and skips ambient motion when reduced motion is requested', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.z = -1000;
    const positions = new Float32Array([0, 0, 0]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const swarm = new THREE.Points(geometry, new THREE.PointsMaterial());
    const target = new Float32Array([10, 10, 10]);
    const ring = new THREE.Mesh();
    const objects: SceneObjects = {
      realm1: new THREE.Group(),
      realm3: new THREE.Group(),
      ring1: ring,
      droneSwarmMesh: swarm,
      morphTargets: { sphere: target, tf: target, falcon: target, helix: target },
    };

    updateWorld(
      objects,
      camera,
      { ...state, droneFormation: 'tf', reducedMotion: true },
      1 / 60,
      1
    );

    expect(Array.from(positions)).toEqual([10, 10, 10]);
    expect(swarm.userData.settledFormation).toBe('tf');
    expect(swarm.rotation.y).toBe(0);

    camera.position.z = 400;
    updateWorld(objects, camera, { ...state, reducedMotion: true }, 1 / 60, 1);
    expect(ring.rotation.z).toBe(0);
    geometry.dispose();
    (swarm.material as THREE.Material).dispose();
  });

  it('does not upload drone positions after a formation settles', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.z = -1000;
    const positions = new Float32Array([10, 10, 10]);
    const geometry = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(positions, 3);
    geometry.setAttribute('position', attr);
    const swarm = new THREE.Points(geometry, new THREE.PointsMaterial());
    swarm.userData.settledFormation = 'sphere';
    const target = new Float32Array([10, 10, 10]);
    const objects: SceneObjects = {
      droneSwarmMesh: swarm,
      morphTargets: { sphere: target, tf: target, falcon: target, helix: target },
    };
    const uploadSpy = vi.spyOn(attr, 'needsUpdate', 'set');

    updateWorld(objects, camera, state, 1 / 60, 1);

    expect(uploadSpy).not.toHaveBeenCalled();
    geometry.dispose();
    (swarm.material as THREE.Material).dispose();
  });
});
