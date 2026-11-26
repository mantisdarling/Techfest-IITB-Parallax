import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SPEEDLINE_SCROLL_DELTA,
  computeScrollProgress,
  realmIndexFromProgress,
} from '../lib/scroll';

export function useScrollTracking() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeRealmIndex, setActiveRealmIndex] = useState(0);
  const [speedlinesActive, setSpeedlinesActive] = useState(false);
  const lastScrollY = useRef(0);
  const speedlineTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashSpeedlines = useCallback((durationMs = 300) => {
    setSpeedlinesActive(true);
    if (speedlineTimeout.current) clearTimeout(speedlineTimeout.current);
    speedlineTimeout.current = setTimeout(() => setSpeedlinesActive(false), durationMs);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const current = window.scrollY;
        const progress = computeScrollProgress(
          current,
          document.documentElement.scrollHeight,
          window.innerHeight
        );
        setScrollProgress(progress);
        setActiveRealmIndex(realmIndexFromProgress(progress));

        if (Math.abs(current - lastScrollY.current) > SPEEDLINE_SCROLL_DELTA) {
          flashSpeedlines(300);
        }
        lastScrollY.current = current;
        ticking = false;
      });
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [flashSpeedlines]);

  useEffect(() => {
    return () => {
      if (speedlineTimeout.current) clearTimeout(speedlineTimeout.current);
    };
  }, []);

  return { scrollProgress, activeRealmIndex, speedlinesActive, flashSpeedlines };
}
