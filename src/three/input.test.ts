import { fireEvent } from '@testing-library/react';
import * as THREE from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { attachDragControls } from './input';

describe('attachDragControls', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rotates the drone swarm with a captured touch pointer', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const dom = document.createElement('canvas');
    const camera = new THREE.PerspectiveCamera();
    const swarm = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial());
    const controls = attachDragControls(
      dom,
      camera,
      { droneSwarmMesh: swarm },
      {
        current: 'scroll',
      }
    );
    Object.defineProperties(dom, {
      setPointerCapture: { value: vi.fn() },
      hasPointerCapture: { value: () => true },
      releasePointerCapture: { value: vi.fn() },
    });

    fireEvent.pointerDown(dom, { pointerId: 3, isPrimary: true, button: 0, clientX: 10 });
    fireEvent.pointerMove(window, { pointerId: 3, isPrimary: true, clientX: 30 });
    expect(swarm.rotation.y).toBeCloseTo(0.16);
    expect(controls.isDragging.current).toBe(true);

    fireEvent.pointerCancel(window, { pointerId: 3, isPrimary: true });
    expect(controls.isDragging.current).toBe(false);
    controls.dispose();
    swarm.geometry.dispose();
    (swarm.material as THREE.Material).dispose();
  });
});
