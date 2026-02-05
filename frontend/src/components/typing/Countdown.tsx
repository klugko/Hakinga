import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  from?: number;
  onComplete: () => void;
  className?: string;
}

function Countdown({ from = 3, onComplete, className }: CountdownProps) {
  const [count, setCount] = useState(from);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      // Show "GO!" briefly then complete
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-[#0f0f0f]/90 backdrop-blur-sm',
        className
      )}
    >
      <div className="text-center animate-pulse">
        {count > 0 ? (
          <span
            key={count}
            className="text-[150px] font-bold text-[#8b5cf6] animate-fadeIn"
            style={{
              textShadow: '0 0 60px rgba(139, 92, 246, 0.5)',
            }}
          >
            {count}
          </span>
        ) : (
          <span
            className="text-[100px] font-bold text-[#22c55e] animate-fadeIn"
            style={{
              textShadow: '0 0 60px rgba(34, 197, 94, 0.5)',
            }}
          >
            GO!
          </span>
        )}
      </div>
    </div>
  );
}

export { Countdown };
