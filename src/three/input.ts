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
  let activePointerId: number | null = null;
  let prev = { x: 0, y: 0 };
  let pending: { x: number; y: number } | null = null;
  let frameId = 0;

  const onPointerDown = (e: PointerEvent) => {
    if (!e.isPrimary || e.button !== 0) return;
    activePointerId = e.pointerId;
    isDragging.current = true;
    prev = { x: e.clientX, y: e.clientY };
    dom.setPointerCapture(e.pointerId);
  };

  const flushMovement = () => {
    frameId = 0;
    if (!pending || !isDragging.current) return;
    const dx = pending.x - prev.x;
    const dy = pending.y - prev.y;

    if (cameraModeRef.current === 'orbit' || cameraModeRef.current === 'fpv') {
      camera.rotation.y -= dx * 0.005;
      camera.rotation.x -= dy * 0.005;
    } else if (objects.droneSwarmMesh) {
      objects.droneSwarmMesh.rotation.y += dx * 0.008;
      objects.droneSwarmMesh.rotation.x += dy * 0.008;
    }
    prev = pending;
    pending = null;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging.current || e.pointerId !== activePointerId) return;
    pending = { x: e.clientX, y: e.clientY };
    if (!frameId) frameId = requestAnimationFrame(flushMovement);
  };

  const endDrag = (e: PointerEvent) => {
    if (e.pointerId !== activePointerId) return;
    isDragging.current = false;
    activePointerId = null;
    pending = null;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    if (dom.hasPointerCapture(e.pointerId)) dom.releasePointerCapture(e.pointerId);
  };

  dom.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  dom.addEventListener('lostpointercapture', endDrag);
  dom.addEventListener('contextmenu', preventContextMenu);

  function preventContextMenu(e: Event) {
    e.preventDefault();
  }

  return {
    isDragging,
    dispose: () => {
      if (frameId) cancelAnimationFrame(frameId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      dom.removeEventListener('lostpointercapture', endDrag);
      dom.removeEventListener('contextmenu', preventContextMenu);
    },
  };
}
