import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PassModal from './PassModal';

const createObjectURL = vi.fn((_blob: Blob) => 'blob:manga-keepsake');
const revokeObjectURL = vi.fn();

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe('PassModal', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('strips control characters and bounds input length', () => {
    render(<PassModal onClose={vi.fn()} />);
    const nameInput = screen.getByLabelText('CALLSIGN / YOUR NAME');
    const collegeInput = screen.getByLabelText('INSTITUTE / COLLEGE');

    fireEvent.change(nameInput, { target: { value: 'AB\u0000\nCD' } });
    expect(nameInput).toHaveValue('ABCD');

    fireEvent.change(nameInput, { target: { value: 'A'.repeat(60) } });
    fireEvent.change(collegeInput, { target: { value: 'B'.repeat(100) } });
    expect(nameInput).toHaveValue('A'.repeat(48));
    expect(collegeInput).toHaveValue('B'.repeat(80));
  });

  it('downloads a plain text keepsake and revokes its object URL', async () => {
    const onClose = vi.fn();
    let downloadedLink: HTMLAnchorElement | undefined;
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloadedLink = this;
    });
    render(<PassModal onClose={onClose} />);

    fireEvent.change(screen.getByLabelText('CALLSIGN / YOUR NAME'), {
      target: { value: 'ROVER PILOT' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE MANGA KEEPSAKE' }));

    expect(downloadedLink?.download).toBe('techfest-manga-keepsake.txt');
    expect(downloadedLink?.href).toBe('blob:manga-keepsake');
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe('text/plain;charset=utf-8');
    const content = await readBlob(blob);
    expect(content).toContain('CALLSIGN: ROVER PILOT');
    expect(content).toContain('not valid for event entry');
    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:manga-keepsake'));
    expect(document.querySelector('a[download]')).not.toBeInTheDocument();
  });

  it('labels the preview as a keepsake without entry access', () => {
    render(<PassModal onClose={vi.fn()} />);
    expect(screen.getByText('FAN KEEPSAKE // NOT VALID FOR ENTRY')).toBeInTheDocument();
    expect(screen.getByText('NO ENTRY ACCESS')).toBeInTheDocument();
    expect(screen.queryByText(/OFFICIAL BOARDING PASS|QR VERIFIED|UNESCO COMPLIANT/)).toBeNull();
  });
});
