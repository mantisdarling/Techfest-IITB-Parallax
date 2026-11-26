import { useCallback, useEffect, useRef, useState } from 'react';
import { DJ_BEAT_PULSE_MS, DJ_BEAT_SEQUENCE, DJ_STEP_MS } from '../lib/audioPresets';
import type { PlaySfx, SfxType } from '../types';

export function useDjSequencer(playSfx: PlaySfx) {
  const [djBeatTrigger, setDjBeatTrigger] = useState(false);
  const [isLoopingBeat, setIsLoopingBeat] = useState(false);
  const djIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerDjPad = useCallback(
    (sfxName: SfxType) => {
      playSfx(sfxName);
      setDjBeatTrigger(true);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = setTimeout(() => setDjBeatTrigger(false), DJ_BEAT_PULSE_MS);
    },
    [playSfx]
  );

  const toggleDjLoop = useCallback(() => {
    if (djIntervalRef.current) {
      clearInterval(djIntervalRef.current);
      djIntervalRef.current = null;
      setIsLoopingBeat(false);
    } else {
      setIsLoopingBeat(true);
      let step = 0;
      djIntervalRef.current = setInterval(() => {
        triggerDjPad(DJ_BEAT_SEQUENCE[step % DJ_BEAT_SEQUENCE.length]);
        step++;
      }, DJ_STEP_MS);
    }
  }, [triggerDjPad]);

  useEffect(() => {
    return () => {
      if (djIntervalRef.current) clearInterval(djIntervalRef.current);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, []);

  return { djBeatTrigger, isLoopingBeat, triggerDjPad, toggleDjLoop };
}
