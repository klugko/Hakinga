import { useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

interface CharState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'corrected';
}

interface TypingAreaProps {
  charStates: CharState[];
  currentIndex: number;
  onKeyDown: (event: KeyboardEvent) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Main typing area component that displays the text to type
 */
export const TypingArea = memo(function TypingArea({
  charStates,
  currentIndex,
  onKeyDown,
  disabled = false,
  className,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      onKeyDown(event);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyDown, disabled]);

  useEffect(() => {
    if (cursorRef.current && containerRef.current) {
      const cursor = cursorRef.current;
      const container = containerRef.current;
      const cursorRect = cursor.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (cursorRect.bottom > containerRect.bottom - 50) {
        container.scrollTop += cursorRect.height * 2;
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handleCut = (e: ClipboardEvent) => e.preventDefault();

    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);

    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative p-8 rounded-xl bg-surface border border-border',
        'font-mono text-xl sm:text-2xl leading-relaxed',
        'max-h-[400px] overflow-y-auto',
        'select-none',
        disabled && 'opacity-60',
        className
      )}
      tabIndex={0}
    >
      <div className="whitespace-pre-wrap break-words">
        {charStates.map((charState, index) => {
          const isCurrent = index === currentIndex;
          const isSpace = charState.char === ' ';

          return (
            <span
              key={index}
              ref={isCurrent ? cursorRef : undefined}
              className={cn(
                'relative transition-colors duration-75',
                charState.status === 'pending' && 'text-text-muted',
                charState.status === 'correct' && 'text-success',
                charState.status === 'incorrect' && 'text-error bg-error/20',
                charState.status === 'corrected' && 'text-warning',
                isCurrent && 'relative'
              )}
            >
              {isCurrent && !disabled && (
                <span
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary animate-cursor-blink"
                  style={{ transform: 'translateX(-2px)' }}
                />
              )}
              {isSpace ? '\u00A0' : charState.char}
            </span>
          );
        })}
      </div>

      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 rounded-xl">
          <p className="text-text-secondary">Session terminee</p>
        </div>
      )}
    </div>
  );
});

interface TypingStatsBarProps {
  wpm: number;
  accuracy: number;
  progress: number;
  duration: number;
  errorsCount: number;
}

/**
 * Stats bar shown during typing session
 */
export function TypingStatsBar({
  wpm,
  accuracy,
  progress,
  duration,
  errorsCount,
}: TypingStatsBarProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-surface border border-border">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{Math.round(wpm)}</p>
          <p className="text-xs text-text-muted uppercase tracking-wider">WPM</p>
        </div>
        <div className="text-center">
          <p className={cn(
            'text-2xl font-bold',
            accuracy >= 0.95 ? 'text-success' : accuracy >= 0.9 ? 'text-warning' : 'text-error'
          )}>
            {(accuracy * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-text-muted uppercase tracking-wider">Precision</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text">{errorsCount}</p>
          <p className="text-xs text-text-muted uppercase tracking-wider">Erreurs</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-text">{formatTime(duration)}</p>
          <p className="text-xs text-text-muted uppercase tracking-wider">Temps</p>
        </div>
        <div className="text-center min-w-[80px]">
          <p className="text-2xl font-bold text-accent">{Math.round(progress)}%</p>
          <p className="text-xs text-text-muted uppercase tracking-wider">Progression</p>
        </div>
      </div>
    </div>
  );
}
