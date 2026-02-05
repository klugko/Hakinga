import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { soundManager } from '@/lib/SoundManager';
import type { SoundPack, SoundEffect, SoundSettings } from '@/types';

interface SoundContextType {
  settings: SoundSettings;
  playKey: (key: string) => void;
  playKeyUp: () => void;
  playFeedback: (sound: 'error' | 'comboMilestone' | 'comboBreak' | 'perfectAccuracy' | 'sessionComplete' | 'newRecord') => void;
  playProgression: (sound: 'xpGain' | 'levelUp' | 'achievementUnlock' | 'rankUp') => void;
  play: (effect: SoundEffect) => void;
  setVolume: (volume: number) => void;
  setPack: (pack: SoundPack) => void;
  toggleSound: () => void;
  toggleKeyboardSounds: () => void;
  toggleFeedbackSounds: () => void;
  toggleProgressionSounds: () => void;
  updateSettings: (settings: Partial<SoundSettings>) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}

interface SoundProviderProps {
  children: ReactNode;
  initialSettings?: Partial<SoundSettings>;
}

const STORAGE_KEY = 'hakinga_sound_settings';

export function SoundProvider({ children, initialSettings }: SoundProviderProps) {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return { ...getDefaultSettings(), ...JSON.parse(stored), ...initialSettings };
        } catch {
          // Invalid JSON, use defaults
        }
      }
    }
    return { ...getDefaultSettings(), ...initialSettings };
  });

  // Initialize sound manager with settings
  useEffect(() => {
    soundManager.init(settings);
    soundManager.preloadAll();
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    soundManager.updateSettings(settings);
  }, [settings]);

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
    setSettings(prev => ({ ...prev, volume }));
  }, []);

  const setPack = useCallback((pack: SoundPack) => {
    setSettings(prev => ({ ...prev, pack }));
    soundManager.preloadPack(pack);
  }, []);

  const toggleSound = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const toggleKeyboardSounds = useCallback(() => {
    setSettings(prev => ({ ...prev, keyboardSounds: !prev.keyboardSounds }));
  }, []);

  const toggleFeedbackSounds = useCallback(() => {
    setSettings(prev => ({ ...prev, feedbackSounds: !prev.feedbackSounds }));
  }, []);

  const toggleProgressionSounds = useCallback(() => {
    setSettings(prev => ({ ...prev, progressionSounds: !prev.progressionSounds }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SoundSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <SoundContext.Provider
      value={{
        settings,
        playKey,
        playKeyUp,
        playFeedback,
        playProgression,
        play,
        setVolume,
        setPack,
        toggleSound,
        toggleKeyboardSounds,
        toggleFeedbackSounds,
        toggleProgressionSounds,
        updateSettings,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

function getDefaultSettings(): SoundSettings {
  return {
    enabled: true,
    volume: 0.5,
    pack: 'mechanical',
    keyboardSounds: true,
    feedbackSounds: true,
    progressionSounds: true,
  };
}
