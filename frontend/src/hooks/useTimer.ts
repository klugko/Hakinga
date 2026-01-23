import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerOptions {
  initialTime?: number;
  countDown?: boolean;
  onComplete?: () => void;
  interval?: number;
}

interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newTime?: number) => void;
  stop: () => void;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const {
    initialTime = 0,
    countDown = false,
    onComplete,
    interval = 1000,
  } = options;

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    startTimeRef.current = Date.now();
    accumulatedTimeRef.current = 0;

    intervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current + accumulatedTimeRef.current) / interval);

      if (countDown) {
        const newTime = initialTime - elapsed;
        if (newTime <= 0) {
          setTime(0);
          clearTimerInterval();
          setIsRunning(false);
          onComplete?.();
        } else {
          setTime(newTime);
        }
      } else {
        setTime(elapsed);
      }
    }, interval);
  }, [isRunning, initialTime, countDown, interval, onComplete, clearTimerInterval]);

  const pause = useCallback(() => {
    if (!isRunning) return;

    clearTimerInterval();
    accumulatedTimeRef.current += Date.now() - startTimeRef.current;
    setIsRunning(false);
  }, [isRunning, clearTimerInterval]);

  const resume = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    startTimeRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current + accumulatedTimeRef.current) / interval);

      if (countDown) {
        const newTime = initialTime - elapsed;
        if (newTime <= 0) {
          setTime(0);
          clearTimerInterval();
          setIsRunning(false);
          onComplete?.();
        } else {
          setTime(newTime);
        }
      } else {
        setTime(elapsed);
      }
    }, interval);
  }, [isRunning, initialTime, countDown, interval, onComplete, clearTimerInterval]);

  const reset = useCallback((newTime?: number) => {
    clearTimerInterval();
    setIsRunning(false);
    setTime(newTime ?? initialTime);
    accumulatedTimeRef.current = 0;
  }, [initialTime, clearTimerInterval]);

  const stop = useCallback(() => {
    clearTimerInterval();
    setIsRunning(false);
  }, [clearTimerInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  return {
    time,
    isRunning,
    start,
    pause,
    resume,
    reset,
    stop,
  };
}
