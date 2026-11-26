import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createScene } from './scene';

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: class {
      domElement = document.createElement('canvas');
      toneMapping = 0;
      setSize = vi.fn();
      setPixelRatio = vi.fn();
      dispose = vi.fn();
    },
  };
});

describe('createScene', () => {
  it('disposes geometries, billboard textures, materials, and the renderer', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const ctx = createScene(container);
    const geometry = new THREE.BufferGeometry();
    const texture = new THREE.Texture();
    const material = new THREE.MeshBasicMaterial({ map: texture });
    ctx.scene.add(new THREE.Mesh(geometry, material));
    const geometryDispose = vi.spyOn(geometry, 'dispose');
    const textureDispose = vi.spyOn(texture, 'dispose');
    const materialDispose = vi.spyOn(material, 'dispose');

    ctx.dispose();

    expect(geometryDispose).toHaveBeenCalledOnce();
    expect(textureDispose).toHaveBeenCalledOnce();
    expect(materialDispose).toHaveBeenCalledOnce();
    expect(ctx.renderer.dispose).toHaveBeenCalledOnce();
    expect(container).toBeEmptyDOMElement();
    container.remove();
  });
});
