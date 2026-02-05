import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { CharacterState } from '@/types';

interface TypingAreaProps {
  characters: CharacterState[];
  currentIndex: number;
  isActive: boolean;
  onFocus?: () => void;
  className?: string;
}

/**
 * Displays the text to be typed with character-by-character highlighting.
 * Supports word wrapping and auto-scrolling to keep current position visible.
 */
function TypingArea({ characters, currentIndex, isActive, onFocus, className }: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

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

  return (
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
      <div className="font-mono text-lg leading-loose select-none whitespace-pre-wrap break-words">
        {characters.map((char, index) => (
          <span
            key={index}
            ref={index === currentIndex ? currentCharRef : null}
            className={cn(
              'typing-char inline',
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
  );
}

export { TypingArea };
