import { fireEvent, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useScrollTracking } from './useScrollTracking';

describe('useScrollTracking', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('samples the initial scroll position and updates it on resize', () => {
    let scrollY = 2000;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(5000);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1000);
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollY);

    const { result, unmount } = renderHook(() => useScrollTracking());
    expect(result.current.scrollProgress).toBe(0.5);
    expect(result.current.activeRealmIndex).toBe(2);

    scrollY = 4000;
    fireEvent.resize(window);
    expect(result.current.scrollProgress).toBe(1);
    expect(result.current.activeRealmIndex).toBe(3);
    unmount();
  });
});
