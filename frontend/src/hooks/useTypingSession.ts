import { useState, useCallback, useRef, useEffect } from 'react';
import type { Keystroke, ErrorType } from '@/types';
import { calculateWpm, calculateAccuracy } from '@/lib/utils';

interface UseTypingSessionOptions {
  text: string;
  onComplete?: (result: TypingResult) => void;
  onProgress?: (progress: number, wpm: number) => void;
}

interface TypingResult {
  wpm: number;
  accuracy: number;
  duration: number;
  errorsCount: number;
  correctChars: number;
  totalChars: number;
  keystrokes: Keystroke[];
}

interface CharState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'corrected';
}

/**
 * Custom hook for managing typing sessions
 */
export function useTypingSession({ text, onComplete, onProgress }: UseTypingSessionOptions) {
  const [charStates, setCharStates] = useState<CharState[]>(() =>
    text.split('').map((char) => ({ char, status: 'pending' }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [_endTime, setEndTime] = useState<number | null>(null);

  const keystrokesRef = useRef<Keystroke[]>([]);
  const lastKeyTimeRef = useRef<number>(0);
  const errorsCountRef = useRef(0);
  const correctCharsRef = useRef(0);
  const sessionIdRef = useRef(`local-${Date.now()}`);

  const reset = useCallback(() => {
    setCharStates(text.split('').map((char) => ({ char, status: 'pending' })));
    setCurrentIndex(0);
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(null);
    setEndTime(null);
    keystrokesRef.current = [];
    lastKeyTimeRef.current = 0;
    errorsCountRef.current = 0;
    correctCharsRef.current = 0;
    sessionIdRef.current = `local-${Date.now()}`;
  }, [text]);

  useEffect(() => {
    reset();
  }, [text, reset]);

  const getCurrentWordIndex = useCallback(() => {
    const textBeforeCursor = text.slice(0, currentIndex);
    return textBeforeCursor.split(' ').length - 1;
  }, [text, currentIndex]);

  const getErrorType = useCallback(
    (expected: string, pressed: string): ErrorType | null => {
      if (pressed === expected) return null;
      if (pressed === 'Backspace') return 'deletion';
      if (expected === ' ' || pressed === ' ') return 'insertion';
      return 'substitution';
    },
    []
  );

  const recordKeystroke = useCallback(
    (keyPressed: string, expectedKey: string, isCorrect: boolean, isBackspace: boolean) => {
      const now = performance.now();
      const timeSinceLastKey = lastKeyTimeRef.current > 0 ? now - lastKeyTimeRef.current : 0;
      lastKeyTimeRef.current = now;

      const keystroke: Keystroke = {
        sessionId: sessionIdRef.current,
        timestamp: now,
        keyPressed,
        expectedKey,
        isCorrect,
        positionInText: currentIndex,
        wordIndex: getCurrentWordIndex(),
        timeSinceLastKey,
        isBackspace,
        errorType: getErrorType(expectedKey, keyPressed),
      };

      keystrokesRef.current.push(keystroke);
    },
    [currentIndex, getCurrentWordIndex, getErrorType]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isFinished) return;

      const key = event.key;

      if (key === 'Tab' || key === 'Escape') {
        event.preventDefault();
        return;
      }

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        key === 'Shift' ||
        key === 'Control' ||
        key === 'Alt' ||
        key === 'Meta' ||
        key === 'CapsLock'
      ) {
        return;
      }

      event.preventDefault();

      if (!isStarted) {
        setIsStarted(true);
        setStartTime(performance.now());
        lastKeyTimeRef.current = performance.now();
      }

      if (key === 'Backspace') {
        if (currentIndex > 0) {
          const prevIndex = currentIndex - 1;
          recordKeystroke('Backspace', text[prevIndex], false, true);

          setCharStates((prev) => {
            const newStates = [...prev];
            if (newStates[prevIndex].status === 'incorrect') {
              errorsCountRef.current = Math.max(0, errorsCountRef.current - 1);
            } else if (newStates[prevIndex].status === 'correct') {
              correctCharsRef.current = Math.max(0, correctCharsRef.current - 1);
            }
            newStates[prevIndex] = { ...newStates[prevIndex], status: 'pending' };
            return newStates;
          });

          setCurrentIndex(prevIndex);
        }
        return;
      }

      if (currentIndex >= text.length) return;

      const expectedChar = text[currentIndex];
      const isCorrect = key === expectedChar;

      recordKeystroke(key, expectedChar, isCorrect, false);

      if (isCorrect) {
        correctCharsRef.current++;
      } else {
        errorsCountRef.current++;
      }

      setCharStates((prev) => {
        const newStates = [...prev];
        newStates[currentIndex] = {
          ...newStates[currentIndex],
          status: isCorrect ? 'correct' : 'incorrect',
        };
        return newStates;
      });

      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      const now = performance.now();
      const duration = now - (startTime || now);
      const currentWpm = calculateWpm(correctCharsRef.current, duration);
      const progress = (newIndex / text.length) * 100;

      onProgress?.(progress, currentWpm);

      if (newIndex === text.length) {
        setIsFinished(true);
        setEndTime(now);

        const finalDuration = now - (startTime || now);
        const finalWpm = calculateWpm(correctCharsRef.current, finalDuration);
        const finalAccuracy = calculateAccuracy(
          correctCharsRef.current,
          correctCharsRef.current + errorsCountRef.current
        );

        const result: TypingResult = {
          wpm: finalWpm,
          accuracy: finalAccuracy,
          duration: finalDuration,
          errorsCount: errorsCountRef.current,
          correctChars: correctCharsRef.current,
          totalChars: text.length,
          keystrokes: keystrokesRef.current,
        };

        onComplete?.(result);
      }
    },
    [currentIndex, isFinished, isStarted, onComplete, onProgress, recordKeystroke, startTime, text]
  );

  const currentWpm = startTime
    ? calculateWpm(correctCharsRef.current, performance.now() - startTime)
    : 0;

  const currentAccuracy =
    correctCharsRef.current + errorsCountRef.current > 0
      ? calculateAccuracy(
          correctCharsRef.current,
          correctCharsRef.current + errorsCountRef.current
        )
      : 1;

  const progress = (currentIndex / text.length) * 100;
  const duration = startTime ? performance.now() - startTime : 0;

  return {
    charStates,
    currentIndex,
    isStarted,
    isFinished,
    currentWpm,
    currentAccuracy,
    progress,
    duration,
    errorsCount: errorsCountRef.current,
    handleKeyDown,
    reset,
    keystrokes: keystrokesRef.current,
  };
}
