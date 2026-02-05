import { useState, useCallback, useRef, useEffect } from 'react';
import type { CharacterState, WpmDataPoint, TypingSession, ComboState, ComboTier } from '@/types';
import { calculateWpm, calculateAccuracy } from '@/lib/utils';
import { COMBO_TIERS } from '@/types';

interface UseTypingSessionOptions {
  text: string;
  onComplete?: (session: Partial<TypingSession> & { maxCombo: number }) => void;
  onComboMilestone?: (tier: ComboTier, combo: number) => void;
  onComboBreak?: (finalCombo: number, maxCombo: number) => void;
}

interface LastKeyPress {
  key: string;
  isError: boolean;
  timestamp: number;
}

interface UseTypingSessionReturn {
  characters: CharacterState[];
  currentIndex: number;
  isStarted: boolean;
  isCompleted: boolean;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  correctCharacters: number;
  elapsedTime: number;
  wpmHistory: WpmDataPoint[];
  handleKeyDown: (e: KeyboardEvent) => void;
  start: () => void;
  reset: () => void;
  progress: number;
  lastKeyPress: LastKeyPress | null;
  combo: ComboState;
}

function getComboTier(combo: number): ComboTier {
  if (combo >= COMBO_TIERS.legendary.threshold) return 'legendary';
  if (combo >= COMBO_TIERS.unstoppable.threshold) return 'unstoppable';
  if (combo >= COMBO_TIERS.incredible.threshold) return 'incredible';
  if (combo >= COMBO_TIERS.amazing.threshold) return 'amazing';
  if (combo >= COMBO_TIERS.great.threshold) return 'great';
  if (combo >= COMBO_TIERS.nice.threshold) return 'nice';
  return 'none';
}

export function useTypingSession({
  text,
  onComplete,
  onComboMilestone,
  onComboBreak,
}: UseTypingSessionOptions): UseTypingSessionReturn {
  // Initialize characters from text
  const initializeCharacters = useCallback((): CharacterState[] => {
    return text.split('').map((char, index) => ({
      char,
      status: index === 0 ? 'current' : 'pending',
    }));
  }, [text]);

  const [characters, setCharacters] = useState<CharacterState[]>(initializeCharacters);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [correctCharacters, setCorrectCharacters] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<WpmDataPoint[]>([]);
  const [lastKeyPress, setLastKeyPress] = useState<LastKeyPress | null>(null);

  // Combo state
  const [combo, setCombo] = useState<ComboState>({
    current: 0,
    max: 0,
    tier: 'none',
    isActive: false,
  });

  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const wpmIntervalRef = useRef<number | null>(null);
  const previousTierRef = useRef<ComboTier>('none');

  // Calculate stats
  const wpm = calculateWpm(correctCharacters, elapsedTime);
  const rawWpm = calculateWpm(totalKeystrokes, elapsedTime);
  const accuracy = calculateAccuracy(correctCharacters, totalKeystrokes);
  const progress = (currentIndex / text.length) * 100;

  // Handle combo increment
  const incrementCombo = useCallback(() => {
    setCombo(prev => {
      const newCurrent = prev.current + 1;
      const newMax = Math.max(prev.max, newCurrent);
      const newTier = getComboTier(newCurrent);

      // Check for milestone (tier change)
      if (newTier !== previousTierRef.current && newTier !== 'none') {
        previousTierRef.current = newTier;
        onComboMilestone?.(newTier, newCurrent);
      }

      return {
        current: newCurrent,
        max: newMax,
        tier: newTier,
        isActive: true,
      };
    });
  }, [onComboMilestone]);

  // Handle combo break
  const breakCombo = useCallback(() => {
    setCombo(prev => {
      if (prev.current > 0) {
        onComboBreak?.(prev.current, prev.max);
      }
      previousTierRef.current = 'none';
      return {
        ...prev,
        current: 0,
        tier: 'none',
        isActive: false,
      };
    });
  }, [onComboBreak]);

  // Start the session
  const start = useCallback(() => {
    if (isStarted) return;

    setIsStarted(true);
    startTimeRef.current = Date.now();

    // Start elapsed time timer
    timerIntervalRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 100);

    // Start WPM tracking interval (every 5 seconds)
    wpmIntervalRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        const time = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setWpmHistory(prev => {
          // Get current stats
          const currentWpm = prev.length > 0 ? prev[prev.length - 1].wpm : 0;
          return [...prev, { time, wpm: currentWpm, accuracy: 0 }];
        });
      }
    }, 5000);
  }, [isStarted]);

  // Handle key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isCompleted) return;
    if (!isStarted) return;

    // Ignore modifier keys and special keys
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key.length > 1 && e.key !== 'Backspace') return;

    e.preventDefault();

    if (e.key === 'Backspace') {
      setLastKeyPress({ key: 'Backspace', isError: false, timestamp: Date.now() });
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setCharacters(prev => {
          const updated = [...prev];
          const prevChar = updated[currentIndex - 1];
          // Only decrement correctCharacters, NOT errors
          // Errors are permanent - they count all mistakes even if corrected
          if (prevChar.status === 'correct') {
            setCorrectCharacters(c => Math.max(0, c - 1));
          }
          updated[currentIndex - 1] = { ...prevChar, status: 'current' };
          if (currentIndex < text.length) {
            updated[currentIndex] = { ...updated[currentIndex], status: 'pending' };
          }
          return updated;
        });
        setTotalKeystrokes(prev => Math.max(0, prev - 1));
      }
      return;
    }

    const expectedChar = text[currentIndex];
    const isCorrect = e.key === expectedChar;

    setLastKeyPress({
      key: e.key,
      isError: !isCorrect,
      timestamp: Date.now(),
    });

    setTotalKeystrokes(prev => prev + 1);

    if (isCorrect) {
      setCorrectCharacters(prev => prev + 1);
      incrementCombo();
    } else {
      setErrors(prev => prev + 1);
      breakCombo();
    }

    setCharacters(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        status: isCorrect ? 'correct' : 'incorrect',
      };

      // Set next character as current if not at end
      if (currentIndex + 1 < text.length) {
        updated[currentIndex + 1] = {
          ...updated[currentIndex + 1],
          status: 'current',
        };
      }

      return updated;
    });

    setCurrentIndex(prev => prev + 1);

    // Update WPM in history
    if (startTimeRef.current) {
      const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const currentCorrect = correctCharacters + (isCorrect ? 1 : 0);
      const currentWpm = calculateWpm(currentCorrect, currentTime);
      const currentAccuracy = calculateAccuracy(currentCorrect, totalKeystrokes + 1);

      setWpmHistory(prev => {
        if (prev.length === 0 || currentTime - prev[prev.length - 1].time >= 2) {
          return [...prev, { time: currentTime, wpm: currentWpm, accuracy: currentAccuracy }];
        }
        // Update the last entry
        const updated = [...prev];
        updated[updated.length - 1] = { time: currentTime, wpm: currentWpm, accuracy: currentAccuracy };
        return updated;
      });
    }

    // Check if completed
    if (currentIndex + 1 === text.length) {
      setIsCompleted(true);

      // Stop timers
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current);
        wpmIntervalRef.current = null;
      }

      // Calculate final stats
      const finalTime = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
      const finalCorrect = correctCharacters + (isCorrect ? 1 : 0);
      const finalErrors = errors + (isCorrect ? 0 : 1);
      const finalWpm = calculateWpm(finalCorrect, finalTime);
      const finalAccuracy = calculateAccuracy(finalCorrect, totalKeystrokes + 1);

      // Get final max combo
      const finalMaxCombo = Math.max(combo.max, combo.current + (isCorrect ? 1 : 0));

      onComplete?.({
        wpm: finalWpm,
        rawWpm: calculateWpm(totalKeystrokes + 1, finalTime),
        accuracy: finalAccuracy,
        errors: finalErrors,
        correctCharacters: finalCorrect,
        totalCharacters: text.length,
        duration: finalTime,
        wpmHistory,
        maxCombo: finalMaxCombo,
      });
    }
  }, [
    currentIndex,
    text,
    isStarted,
    isCompleted,
    correctCharacters,
    totalKeystrokes,
    errors,
    wpmHistory,
    onComplete,
    combo,
    incrementCombo,
    breakCombo,
  ]);

  // Reset the session
  const reset = useCallback(() => {
    // Stop timers
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = null;
    }

    setCharacters(initializeCharacters());
    setCurrentIndex(0);
    setIsStarted(false);
    setIsCompleted(false);
    setErrors(0);
    setCorrectCharacters(0);
    setTotalKeystrokes(0);
    setElapsedTime(0);
    setWpmHistory([]);
    setLastKeyPress(null);
    setCombo({
      current: 0,
      max: 0,
      tier: 'none',
      isActive: false,
    });
    previousTierRef.current = 'none';
    startTimeRef.current = null;
  }, [initializeCharacters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
    };
  }, []);

  // Reset when text changes
  useEffect(() => {
    reset();
  }, [text, reset]);

  return {
    characters,
    currentIndex,
    isStarted,
    isCompleted,
    wpm,
    rawWpm,
    accuracy,
    errors,
    correctCharacters,
    elapsedTime,
    wpmHistory,
    handleKeyDown,
    start,
    reset,
    progress,
    lastKeyPress,
    combo,
  };
}
