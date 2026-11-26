import { useCallback, useEffect, useRef, useState } from 'react';
import { SFX_PRESETS } from '../lib/audioPresets';
import type { PlaySfx, SfxType } from '../types';

export function useAudioSynth() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSfx = useCallback<PlaySfx>(
    (type: SfxType = 'click') => {
      if (!soundEnabledRef.current) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const preset = SFX_PRESETS[type];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = preset.wave;
        osc.frequency.setValueAtTime(preset.freqStart, ctx.currentTime);
        if (preset.freqEnd !== null) {
          osc.frequency.exponentialRampToValueAtTime(
            preset.freqEnd,
            ctx.currentTime + preset.duration
          );
        }
        gain.gain.setValueAtTime(preset.gain, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + preset.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
        osc.start();
        osc.stop(ctx.currentTime + preset.duration);
      } catch (error) {
        console.warn('Audio playback unavailable:', error);
      }
    },
    [getAudioContext]
  );

  const toggleSound = useCallback(() => {
    const next = !soundEnabledRef.current;
    soundEnabledRef.current = next;
    setSoundEnabled(next);
    if (next) playSfx('kick');
  }, [playSfx]);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, []);

  return { soundEnabled, toggleSound, playSfx };
}
