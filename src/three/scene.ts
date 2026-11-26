import * as THREE from 'three';
import type { DroneFormation } from '../types';

export interface SceneObjects {
  realm1?: THREE.Group;
  realm2?: THREE.Group;
  realm3?: THREE.Group;
  realm4?: THREE.Group;
  ring1?: THREE.Mesh;
  goalMesh?: THREE.Mesh;
  bot?: THREE.Group;
  lidar?: THREE.Mesh;
  radar?: THREE.Mesh;
  droneSwarmMesh?: THREE.Points;
  morphTargets?: Record<DroneFormation, Float32Array>;
  sphereWire?: THREE.Mesh;
  monoliths?: THREE.Mesh[];
  eqBars?: THREE.Mesh[];
}

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  dispose: () => void;
}

export function createScene(container: HTMLElement): SceneContext {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  // Smooth distance fog hides distant realms without visual bleed
  scene.fog = new THREE.Fog(0x000000, 300, 750);

  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 4000);
  camera.position.set(0, 0, 400);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NoToneMapping;
  container.appendChild(renderer.domElement);

  const dispose = () => {
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
    scene.traverse((obj) => {
      if (
        obj instanceof THREE.Mesh ||
        obj instanceof THREE.Points ||
        obj instanceof THREE.LineSegments
      ) {
        obj.geometry.dispose();
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.forEach((m) => {
          if (m instanceof THREE.MeshBasicMaterial && m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
    renderer.dispose();
  };

  return { scene, camera, renderer, dispose };
}

export function buildStarfield(scene: THREE.Scene): void {
  const particleCount = 1400;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 1800;
    positions[i + 1] = (Math.random() - 0.5) * 1800;
    positions[i + 2] = (Math.random() - 0.5) * 2600 - 600;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2.2,
    transparent: true,
    opacity: 0.85,
  });
  scene.add(new THREE.Points(geo, mat));
}

export function attachResize(container: HTMLElement, ctx: SceneContext): () => void {
  const handleResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    ctx.camera.aspect = w / h;
    ctx.camera.updateProjectionMatrix();
    ctx.renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}
