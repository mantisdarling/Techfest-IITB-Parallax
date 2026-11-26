import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RoverController from './RoverController';

describe('RoverController', () => {
  it('captures pointer input and releases steering on cancellation', () => {
    const onSteer = vi.fn();
    const onRelease = vi.fn();
    render(<RoverController goalAchieved={false} onSteer={onSteer} onRelease={onRelease} />);
    const forward = screen.getByRole('button', { name: 'Steer rover forward' });
    const setPointerCapture = vi.fn();
    const releasePointerCapture = vi.fn();
    Object.defineProperties(forward, {
      setPointerCapture: { value: setPointerCapture },
      hasPointerCapture: { value: () => true },
      releasePointerCapture: { value: releasePointerCapture },
    });

    fireEvent.pointerDown(forward, { pointerId: 7, isPrimary: true, button: 0 });
    expect(setPointerCapture).toHaveBeenCalledWith(7);
    expect(onSteer).toHaveBeenCalledWith({ x: 0, z: -1, active: true });

    fireEvent.pointerCancel(forward, { pointerId: 7, isPrimary: true });
    expect(onRelease).toHaveBeenCalledOnce();
  });
});
