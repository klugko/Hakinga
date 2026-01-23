import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  seconds: number;
  onComplete: () => void;
  className?: string;
}

/**
 * Animated countdown component for race starts
 */
export function Countdown({ seconds, onComplete, className }: CountdownProps) {
  const [count, setCount] = useState(seconds);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (count <= 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }

    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCount((prev) => prev - 1);
        setIsVisible(true);
      }, 100);
    }, 1000);

    return () => clearInterval(timer);
  }, [count, onComplete]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm',
        className
      )}
    >
      <div className="text-center">
        <div
          className={cn(
            'text-9xl font-bold transition-all duration-200',
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
            count <= 0 ? 'text-success' : 'text-primary'
          )}
        >
          {count <= 0 ? 'GO!' : count}
        </div>
        <p className="mt-4 text-xl text-text-secondary">
          {count <= 0 ? 'Commencez a taper !' : 'Preparez-vous...'}
        </p>
      </div>
    </div>
  );
}

interface MiniCountdownProps {
  seconds: number;
  onComplete: () => void;
  label?: string;
}

/**
 * Smaller countdown for inline use
 */
export function MiniCountdown({ seconds, onComplete, label }: MiniCountdownProps) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [count, onComplete]);

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-text-secondary">{label}</span>}
      <span className="text-2xl font-bold text-primary tabular-nums">{count}</span>
    </div>
  );
}
