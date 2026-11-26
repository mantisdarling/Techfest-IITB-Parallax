import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Boom(): never {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>ALL SYSTEMS NOMINAL</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('ALL SYSTEMS NOMINAL')).toBeInTheDocument();
  });

  it('shows the manga fallback when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/SYSTEM FAILURE DETECTED/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /REBOOT SYSTEM/ })).toBeInTheDocument();
    spy.mockRestore();
  });
});
