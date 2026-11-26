import * as THREE from 'three';
import type { CameraMode } from '../types';
import type { SceneObjects } from './scene';

export interface DragControls {
  isDragging: { current: boolean };
  dispose: () => void;
}

export function attachDragControls(
  dom: HTMLElement,
  camera: THREE.PerspectiveCamera,
  objects: SceneObjects,
  cameraModeRef: { current: CameraMode }
): DragControls {
  const isDragging = { current: false };
  let prev = { x: 0, y: 0 };

  const onMouseDown = (e: MouseEvent) => {
    isDragging.current = true;
    prev = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;

    if (cameraModeRef.current === 'orbit' || cameraModeRef.current === 'fpv') {
      camera.rotation.y -= dx * 0.005;
      camera.rotation.x -= dy * 0.005;
    } else if (objects.droneSwarmMesh) {
      objects.droneSwarmMesh.rotation.y += dx * 0.008;
      objects.droneSwarmMesh.rotation.x += dy * 0.008;
    }
    prev = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  dom.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  return {
    isDragging,
    dispose: () => {
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    },
  };
}
