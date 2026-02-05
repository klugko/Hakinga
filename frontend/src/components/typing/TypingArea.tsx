import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { CharacterState, ComboState } from '@/types';
import { ComboCounter, StreakFire, ErrorShake } from '@/components/effects';

interface TypingAreaProps {
  characters: CharacterState[];
  currentIndex: number;
  isActive: boolean;
  onFocus?: () => void;
  className?: string;
  combo?: ComboState;
  showCombo?: boolean;
  showEffects?: boolean;
  lastKeyWasError?: boolean;
}

/**
 * Displays the text to be typed with character-by-character highlighting.
 * Supports word wrapping, auto-scrolling, combo display, and visual effects.
 */
function TypingArea({
  characters,
  currentIndex,
  isActive,
  onFocus,
  className,
  combo,
  showCombo = true,
  showEffects = true,
  lastKeyWasError = false,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const [errorTrigger, setErrorTrigger] = useState(false);

  // Trigger error shake
  useEffect(() => {
    if (lastKeyWasError && showEffects) {
      setErrorTrigger(true);
      const timer = setTimeout(() => setErrorTrigger(false), 100);
      return () => clearTimeout(timer);
    }
  }, [lastKeyWasError, currentIndex, showEffects]);

  useEffect(() => {
    if (currentCharRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentChar = currentCharRef.current;

      const containerRect = container.getBoundingClientRect();
      const charRect = currentChar.getBoundingClientRect();

      if (charRect.bottom > containerRect.bottom - 40) {
        container.scrollTop += charRect.bottom - containerRect.bottom + 60;
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleClick = () => {
      onFocus?.();
    };

    const container = containerRef.current;
    container?.addEventListener('click', handleClick);
    return () => container?.removeEventListener('click', handleClick);
  }, [onFocus]);

  const comboIntensity = combo ? Math.min(100, combo.current) : 0;

  return (
    <div className="relative">
      {/* Combo counter - positioned above typing area */}
      {showCombo && combo && combo.current > 0 && (
        <div className="absolute -top-16 right-4 z-10">
          <ComboCounter combo={combo} size="md" />
        </div>
      )}

      <ErrorShake trigger={errorTrigger} intensity="light">
        <div
          ref={containerRef}
          className={cn(
            'relative bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 overflow-y-auto',
            'transition-all duration-200',
            isActive ? 'ring-2 ring-[#8b5cf6] ring-offset-2 ring-offset-[#0f0f0f]' : '',
            className
          )}
          style={{ maxHeight: '200px' }}
          tabIndex={0}
        >
          {/* Fire effect for high combos */}
          {showEffects && (
            <StreakFire
              intensity={comboIntensity}
              active={isActive && combo ? combo.current >= 10 : false}
              position="border"
            />
          )}

          <div className="font-mono text-lg leading-loose select-none whitespace-pre-wrap break-words">
            {characters.map((char, index) => (
              <span
                key={index}
                ref={index === currentIndex ? currentCharRef : null}
                className={cn(
                  'typing-char inline transition-colors duration-100',
                  char.status === 'correct' && 'text-white',
                  char.status === 'incorrect' && 'text-[#ef4444] bg-[#ef4444]/20',
                  char.status === 'current' && 'bg-[#8b5cf6] text-white rounded-sm',
                  char.status === 'pending' && 'text-[#71717a]'
                )}
              >
                {char.char}
              </span>
            ))}
          </div>

          {!isActive && (
            <div className="absolute inset-0 bg-[#0f0f0f]/50 backdrop-blur-sm flex items-center justify-center rounded-xl cursor-pointer">
              <div className="text-center">
                <p className="text-[#a1a1aa] text-lg">Click here or press any key to start</p>
              </div>
            </div>
          )}
        </div>
      </ErrorShake>
    </div>
  );
}

export { TypingArea };
