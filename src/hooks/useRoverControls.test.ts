import { act, fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRoverControls } from './useRoverControls';

describe('useRoverControls', () => {
  it('prevents scrolling, ignores repeats, and fully releases steering', () => {
    const playSfx = vi.fn();
    const { result } = renderHook(() => useRoverControls(1, playSfx));

    const keyDown = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
    act(() => window.dispatchEvent(keyDown));
    expect(keyDown.defaultPrevented).toBe(true);
    expect(result.current.botControl).toEqual({ x: 0, z: -1, active: true });

    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', repeat: true })));
    expect(playSfx).toHaveBeenCalledOnce();

    act(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' })));
    expect(result.current.botControl).toEqual({ x: 0, z: 0, active: false });
  });

  it('releases steering when the window loses focus', () => {
    const { result } = renderHook(() => useRoverControls(1, vi.fn()));
    fireEvent.keyDown(window, { key: 'd' });
    expect(result.current.botControl.active).toBe(true);

    fireEvent.blur(window);

    expect(result.current.botControl).toEqual({ x: 0, z: 0, active: false });
  });

  it('ignores steering keys typed into editable controls', () => {
    const playSfx = vi.fn();
    const { result } = renderHook(() => useRoverControls(1, playSfx));
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: 'd' });

    expect(result.current.botControl).toEqual({ x: 0, z: 0, active: false });
    expect(playSfx).not.toHaveBeenCalled();
    input.remove();
  });
});
