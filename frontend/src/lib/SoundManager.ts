/**
 * Sound Manager - Handles all audio playback for the application
 */
import type { SoundPack, SoundEffect, SoundSettings } from '@/types';

interface SoundConfig {
  src: string;
  volume?: number;
}

type SoundLibrary = Record<SoundPack, Record<string, SoundConfig>>;
type FeedbackSounds = Record<string, SoundConfig>;

// Sound file paths organized by pack
const KEYBOARD_SOUNDS: SoundLibrary = {
  mechanical: {
    keyDown: { src: '/sounds/mechanical/key-down.mp3', volume: 0.3 },
    keyUp: { src: '/sounds/mechanical/key-up.mp3', volume: 0.2 },
    space: { src: '/sounds/mechanical/space.mp3', volume: 0.35 },
    enter: { src: '/sounds/mechanical/enter.mp3', volume: 0.4 },
  },
  soft: {
    keyDown: { src: '/sounds/soft/key-down.mp3', volume: 0.2 },
    keyUp: { src: '/sounds/soft/key-up.mp3', volume: 0.15 },
    space: { src: '/sounds/soft/space.mp3', volume: 0.25 },
    enter: { src: '/sounds/soft/enter.mp3', volume: 0.3 },
  },
  typewriter: {
    keyDown: { src: '/sounds/typewriter/key-down.mp3', volume: 0.4 },
    keyUp: { src: '/sounds/typewriter/key-up.mp3', volume: 0.25 },
    space: { src: '/sounds/typewriter/space.mp3', volume: 0.45 },
    enter: { src: '/sounds/typewriter/enter.mp3', volume: 0.5 },
  },
  none: {},
};

const FEEDBACK_SOUNDS: FeedbackSounds = {
  error: { src: '/sounds/feedback/error.mp3', volume: 0.3 },
  comboMilestone: { src: '/sounds/feedback/combo-milestone.mp3', volume: 0.5 },
  comboBreak: { src: '/sounds/feedback/combo-break.mp3', volume: 0.4 },
  perfectAccuracy: { src: '/sounds/feedback/perfect.mp3', volume: 0.6 },
  sessionComplete: { src: '/sounds/feedback/complete.mp3', volume: 0.5 },
  newRecord: { src: '/sounds/feedback/new-record.mp3', volume: 0.6 },
};

const PROGRESSION_SOUNDS: FeedbackSounds = {
  xpGain: { src: '/sounds/progression/xp-gain.mp3', volume: 0.4 },
  levelUp: { src: '/sounds/progression/level-up.mp3', volume: 0.7 },
  achievementUnlock: { src: '/sounds/progression/achievement.mp3', volume: 0.6 },
  rankUp: { src: '/sounds/progression/rank-up.mp3', volume: 0.7 },
};

class SoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private settings: SoundSettings = {
    enabled: true,
    volume: 0.5,
    pack: 'mechanical',
    keyboardSounds: true,
    feedbackSounds: true,
    progressionSounds: true,
  };

  /**
   * Initialize the sound manager with user settings
   */
  init(settings?: Partial<SoundSettings>) {
    if (settings) {
      this.settings = { ...this.settings, ...settings };
    }
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<SoundSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): SoundSettings {
    return { ...this.settings };
  }

  /**
   * Preload a sound file
   */
  private preload(src: string): HTMLAudioElement {
    if (this.audioCache.has(src)) {
      return this.audioCache.get(src)!;
    }

    const audio = new Audio(src);
    audio.preload = 'auto';
    this.audioCache.set(src, audio);
    return audio;
  }

  /**
   * Play a sound
   */
  private async playSound(config: SoundConfig | undefined, volumeOverride?: number): Promise<void> {
    if (!this.settings.enabled || !config) return;

    try {
      const audio = this.preload(config.src);
      const clone = audio.cloneNode() as HTMLAudioElement;

      const baseVolume = config.volume ?? 1;
      const finalVolume = (volumeOverride ?? baseVolume) * this.settings.volume;
      clone.volume = Math.min(1, Math.max(0, finalVolume));

      await clone.play();
    } catch (error) {
      // Silently fail - user may not have interacted with page yet
      console.debug('Sound playback failed:', error);
    }
  }

  /**
   * Play keyboard sound
   */
  playKey(key: string) {
    if (!this.settings.keyboardSounds || this.settings.pack === 'none') return;

    const packSounds = KEYBOARD_SOUNDS[this.settings.pack];
    if (!packSounds) return;

    if (key === ' ') {
      this.playSound(packSounds.space);
    } else if (key === 'Enter') {
      this.playSound(packSounds.enter);
    } else if (key === 'Backspace') {
      // Optional: could add a backspace sound
      this.playSound(packSounds.keyUp);
    } else {
      this.playSound(packSounds.keyDown);
    }
  }

  /**
   * Play key up sound (for key release)
   */
  playKeyUp() {
    if (!this.settings.keyboardSounds || this.settings.pack === 'none') return;

    const packSounds = KEYBOARD_SOUNDS[this.settings.pack];
    if (packSounds?.keyUp) {
      this.playSound(packSounds.keyUp);
    }
  }

  /**
   * Play feedback sound
   */
  playFeedback(sound: 'error' | 'comboMilestone' | 'comboBreak' | 'perfectAccuracy' | 'sessionComplete' | 'newRecord') {
    if (!this.settings.feedbackSounds) return;
    this.playSound(FEEDBACK_SOUNDS[sound]);
  }

  /**
   * Play progression sound
   */
  playProgression(sound: 'xpGain' | 'levelUp' | 'achievementUnlock' | 'rankUp') {
    if (!this.settings.progressionSounds) return;
    this.playSound(PROGRESSION_SOUNDS[sound]);
  }

  /**
   * Play any sound effect by name
   */
  play(effect: SoundEffect) {
    switch (effect) {
      case 'keyDown':
      case 'keyUp':
      case 'space':
      case 'enter':
        if (this.settings.keyboardSounds && this.settings.pack !== 'none') {
          const packSounds = KEYBOARD_SOUNDS[this.settings.pack];
          this.playSound(packSounds[effect]);
        }
        break;

      case 'error':
      case 'comboMilestone':
      case 'comboBreak':
      case 'perfectAccuracy':
      case 'sessionComplete':
      case 'newRecord':
        this.playFeedback(effect);
        break;

      case 'xpGain':
      case 'levelUp':
      case 'achievementUnlock':
      case 'rankUp':
        this.playProgression(effect);
        break;
    }
  }

  /**
   * Preload all sounds for a pack
   */
  preloadPack(pack: SoundPack) {
    if (pack === 'none') return;

    const packSounds = KEYBOARD_SOUNDS[pack];
    if (packSounds) {
      Object.values(packSounds).forEach(config => {
        this.preload(config.src);
      });
    }
  }

  /**
   * Preload all feedback sounds
   */
  preloadFeedback() {
    Object.values(FEEDBACK_SOUNDS).forEach(config => {
      this.preload(config.src);
    });
  }

  /**
   * Preload all progression sounds
   */
  preloadProgression() {
    Object.values(PROGRESSION_SOUNDS).forEach(config => {
      this.preload(config.src);
    });
  }

  /**
   * Preload all sounds
   */
  preloadAll() {
    this.preloadPack(this.settings.pack);
    this.preloadFeedback();
    this.preloadProgression();
  }

  /**
   * Set master volume
   */
  setVolume(volume: number) {
    this.settings.volume = Math.min(1, Math.max(0, volume));
  }

  /**
   * Toggle sound enabled/disabled
   */
  toggle() {
    this.settings.enabled = !this.settings.enabled;
  }

  /**
   * Enable sounds
   */
  enable() {
    this.settings.enabled = true;
  }

  /**
   * Disable sounds
   */
  disable() {
    this.settings.enabled = false;
  }

  /**
   * Change sound pack
   */
  setPack(pack: SoundPack) {
    this.settings.pack = pack;
    if (pack !== 'none') {
      this.preloadPack(pack);
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
export default soundManager;
