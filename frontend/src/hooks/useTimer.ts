import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTimerOptions {
  initialTime?: number;
  autoStart?: boolean;
  onTick?: (time: number) => void;
  onComplete?: () => void;
}

interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  restart: () => void;
}

/**
 * Custom hook for managing timers (countdown or countup)
 */
export function useTimer({
  initialTime = 0,
  autoStart = false,
  onTick,
  onComplete,
}: UseTimerOptions = {}): UseTimerReturn {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(initialTime);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    accumulatedTimeRef.current = time;
  }, [time]);

  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    startTimeRef.current = performance.now();

    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current;
      const newTime = accumulatedTimeRef.current + elapsed;
      setTime(newTime);
      onTick?.(newTime);
    }, 100);
  }, [isRunning, onTick]);

  const reset = useCallback(() => {
    stop();
    setTime(initialTime);
    accumulatedTimeRef.current = initialTime;
  }, [initialTime, stop]);

  const restart = useCallback(() => {
    reset();
    start();
  }, [reset, start]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoStart, start]);

  useEffect(() => {
    if (initialTime > 0 && time <= 0 && isRunning) {
      stop();
      onComplete?.();
    }
  }, [time, initialTime, isRunning, stop, onComplete]);

  return {
    time,
    isRunning,
    start,
    stop,
    reset,
    restart,
  };
}

/**
 * Custom hook for countdown timer
 */
export function useCountdown(
  seconds: number,
  options: { autoStart?: boolean; onComplete?: () => void } = {}
) {
  const [count, setCount] = useState(seconds);
  const [isRunning, setIsRunning] = useState(options.autoStart ?? false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (isRunning || count <= 0) return;
    setIsRunning(true);
  }, [isRunning, count]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setCount(seconds);
  }, [seconds, stop]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          stop();
          options.onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, stop, options]);

  return {
    count,
    isRunning,
    start,
    stop,
    reset,
  };
}
