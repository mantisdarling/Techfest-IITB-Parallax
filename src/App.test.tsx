import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

vi.mock('./ThreeScene', () => ({
  default: () => <div data-testid="three-scene" />,
}));

async function renderApp() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByTestId('three-scene');
  return user;
}

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the HUD and all four manga realms', async () => {
    await renderApp();
    expect(screen.getByText('TECHFEST 2026')).toBeInTheDocument();
    expect(screen.getByText('WHERE IDEAS TAKE FLIGHT')).toBeInTheDocument();
    expect(screen.getByText('MESHME RIZE ROBOWARS')).toBeInTheDocument();
    expect(screen.getByText('CELESTIAL DRONE MATRIX')).toBeInTheDocument();
    expect(screen.getByText('TECHNOHOLIX MEGASTAGE')).toBeInTheDocument();
  });

  it('exposes every manga sound badge as a native button', async () => {
    const user = await renderApp();
    const badges = screen.getAllByRole('button', { name: /Play manga sound effect/ });
    expect(badges).toHaveLength(4);
    await user.click(badges[0]);
    expect(document.querySelector('.speedlines')).toHaveClass('active');
  });

  it('toggles sound effects', async () => {
    const user = await renderApp();
    const sfx = screen.getByRole('button', { name: 'Toggle sound effects' });
    expect(sfx).toHaveAttribute('aria-pressed', 'false');
    await user.click(sfx);
    expect(sfx).toHaveAttribute('aria-pressed', 'true');
    await user.click(sfx);
    expect(sfx).toHaveAttribute('aria-pressed', 'false');
  });

  it('opens and closes the campus venue map', async () => {
    const user = await renderApp();
    await user.click(screen.getByRole('button', { name: 'Open campus venue map' }));
    const dialog = screen.getByRole('dialog', { name: 'Campus venue map' });
    expect(within(dialog).getByText('GYMKHANA GROUNDS')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Close campus map' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the campus map with Escape and restores focus', async () => {
    const user = await renderApp();
    const opener = screen.getByRole('button', { name: 'Open campus venue map' });
    await user.click(opener);
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Campus venue map' }), {
      key: 'Escape',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('moves focus into the campus map, traps Tab, and restores focus on close', async () => {
    const user = await renderApp();
    const opener = screen.getByRole('button', { name: 'Open campus venue map' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Campus venue map' });
    const closeButton = within(dialog).getByRole('button', { name: 'Close campus map' });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true });
    expect(within(dialog).getByRole('button', { name: /SAC LAWNS/ })).toHaveFocus();

    await user.click(closeButton);
    expect(opener).toHaveFocus();
  });

  it('warps campus venues to their corresponding realms', async () => {
    const user = await renderApp();
    let scrolledRealmId = '';
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(function (this: Element) {
      scrolledRealmId = this.id;
    });
    await user.click(screen.getByRole('button', { name: 'Open campus venue map' }));
    const dialog = screen.getByRole('dialog', { name: 'Campus venue map' });
    await user.click(within(dialog).getByRole('button', { name: /OPEN AIR THEATRE/ }));
    expect(scrolledRealmId).toBe('stage');
  });

  it('opens a dossier and transitions to the pass generator', async () => {
    const user = await renderApp();
    await user.click(screen.getAllByRole('button', { name: /INSPECT DOSSIER/ })[0]);
    const dossier = screen.getByRole('dialog', { name: 'Realm dossier' });
    expect(within(dossier).getByText('WHERE IDEAS TAKE FLIGHT')).toBeInTheDocument();
    await user.click(within(dossier).getByRole('button', { name: /CREATE MANGA PASS/ }));
    expect(screen.queryByRole('dialog', { name: 'Realm dossier' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Cyber pass generator' })).toBeInTheDocument();
  });

  it('live-updates the manga keepsake preview', async () => {
    const user = await renderApp();
    await user.click(screen.getByRole('button', { name: /GET PASS/ }));
    const dialog = screen.getByRole('dialog', { name: 'Cyber pass generator' });
    const nameInput = within(dialog).getByLabelText('CALLSIGN / YOUR NAME');
    await user.clear(nameInput);
    await user.type(nameInput, 'ROVER PILOT');
    expect(within(dialog).getByText('ROVER PILOT')).toBeInTheDocument();
  });

  it('switches drone formations', async () => {
    const user = await renderApp();
    const tf = screen.getByRole('button', { name: '02 // TF CREST' });
    expect(tf).not.toHaveClass('active');
    await user.click(tf);
    expect(tf).toHaveClass('active');
  });

  it('enters and exits cockpit mode with Escape and the exit button', async () => {
    const user = await renderApp();
    await user.click(screen.getByRole('button', { name: 'COCKPIT' }));
    expect(screen.getByText(/MECHA RADAR LOCK/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText(/MECHA RADAR LOCK/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'COCKPIT' }));
    await user.click(screen.getByRole('button', { name: /EXIT COCKPIT VIEW/ }));
    expect(screen.queryByText(/MECHA RADAR LOCK/)).not.toBeInTheDocument();
  });

  it('steers the rover with keyboard in the arena realm and reports speed in cockpit', async () => {
    await renderApp();
    const scrollHeightSpy = vi
      .spyOn(document.documentElement, 'scrollHeight', 'get')
      .mockReturnValue(5000);
    const scrollYSpy = vi.spyOn(window, 'scrollY', 'get').mockReturnValue(1500);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '02 // 闘魂' })).toHaveClass('active');
    });

    fireEvent.keyDown(window, { key: 'd' });
    fireEvent.click(screen.getByRole('button', { name: /ENTER COCKPIT/ }));
    expect(screen.getByText(/SPEED: 3.8 M\/S/)).toBeInTheDocument();
    fireEvent.keyUp(window, { key: 'd' });

    scrollHeightSpy.mockRestore();
    scrollYSpy.mockRestore();
  });
});
