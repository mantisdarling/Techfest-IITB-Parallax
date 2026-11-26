import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MobileNav from './MobileNav';

const props = {
  activeRealmIndex: 0,
  cameraMode: 'scroll' as const,
  onWarp: vi.fn(),
  onCameraModeChange: vi.fn(),
};

describe('MobileNav', () => {
  it('opens realm and camera controls and applies the selected mode', async () => {
    const user = userEvent.setup();
    render(<MobileNav {...props} />);
    const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'FPV DRONE' }));
    expect(props.onCameraModeChange).toHaveBeenCalledWith('fpv');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup();
    render(<MobileNav {...props} />);
    const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
    await user.click(toggle);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });
});
