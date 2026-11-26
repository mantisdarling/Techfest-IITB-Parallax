import { fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRoverControls } from './useRoverControls';

describe('useRoverControls', () => {
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
