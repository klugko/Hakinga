import { useCallback, useEffect } from 'react';
import { soundManager } from '@/lib/SoundManager';
import type { SoundPack, SoundEffect, SoundSettings } from '@/types';

interface UseSoundOptions {
  initialSettings?: Partial<SoundSettings>;
  preloadAll?: boolean;
}

interface UseSoundReturn {
  playKey: (key: string) => void;
  playKeyUp: () => void;
  playFeedback: (sound: 'error' | 'comboMilestone' | 'comboBreak' | 'perfectAccuracy' | 'sessionComplete' | 'newRecord') => void;
  playProgression: (sound: 'xpGain' | 'levelUp' | 'achievementUnlock' | 'rankUp') => void;
  play: (effect: SoundEffect) => void;
  setVolume: (volume: number) => void;
  setPack: (pack: SoundPack) => void;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
  updateSettings: (settings: Partial<SoundSettings>) => void;
  getSettings: () => SoundSettings;
}

export function useSound(options: UseSoundOptions = {}): UseSoundReturn {
  const { initialSettings, preloadAll = true } = options;

  // Initialize sound manager on mount
  useEffect(() => {
    soundManager.init(initialSettings);

    if (preloadAll) {
      soundManager.preloadAll();
    }
  }, [initialSettings, preloadAll]);

  const playKey = useCallback((key: string) => {
    soundManager.playKey(key);
  }, []);

  const playKeyUp = useCallback(() => {
    soundManager.playKeyUp();
  }, []);

  const playFeedback = useCallback(
    (sound: 'error' | 'comboMilestone' | 'comboBreak' | 'perfectAccuracy' | 'sessionComplete' | 'newRecord') => {
      soundManager.playFeedback(sound);
    },
    []
  );

  const playProgression = useCallback(
    (sound: 'xpGain' | 'levelUp' | 'achievementUnlock' | 'rankUp') => {
      soundManager.playProgression(sound);
    },
    []
  );

  const play = useCallback((effect: SoundEffect) => {
    soundManager.play(effect);
  }, []);

  const setVolume = useCallback((volume: number) => {
    soundManager.setVolume(volume);
  }, []);

  const setPack = useCallback((pack: SoundPack) => {
    soundManager.setPack(pack);
  }, []);

  const toggle = useCallback(() => {
    soundManager.toggle();
  }, []);

  const enable = useCallback(() => {
    soundManager.enable();
  }, []);

  const disable = useCallback(() => {
    soundManager.disable();
  }, []);

  const updateSettings = useCallback((settings: Partial<SoundSettings>) => {
    soundManager.updateSettings(settings);
  }, []);

  const getSettings = useCallback(() => {
    return soundManager.getSettings();
  }, []);

  return {
    playKey,
    playKeyUp,
    playFeedback,
    playProgression,
    play,
    setVolume,
    setPack,
    toggle,
    enable,
    disable,
    updateSettings,
    getSettings,
  };
}

export default useSound;
