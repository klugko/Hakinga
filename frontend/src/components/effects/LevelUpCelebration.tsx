import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { RankTier } from '@/types';
import { RANK_COLORS } from '@/types';
import Confetti from './Confetti';

interface LevelUpCelebrationProps {
  newLevel: number;
  rankTier?: RankTier;
  isVisible: boolean;
  onComplete?: () => void;
}

export function LevelUpCelebration({
  newLevel,
  rankTier = 'unranked',
  isVisible,
  onComplete,
}: LevelUpCelebrationProps) {
  const [stage, setStage] = useState<'enter' | 'display' | 'exit' | 'hidden'>('hidden');
  const rankColor = RANK_COLORS[rankTier];

  useEffect(() => {
    if (isVisible) {
      setStage('enter');
      const timer1 = setTimeout(() => setStage('display'), 300);
      const timer2 = setTimeout(() => setStage('exit'), 2500);
      const timer3 = setTimeout(() => {
        setStage('hidden');
        onComplete?.();
      }, 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, onComplete]);

  if (stage === 'hidden') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 transition-opacity duration-300',
          stage === 'enter' && 'opacity-0',
          stage === 'display' && 'opacity-100',
          stage === 'exit' && 'opacity-0'
        )}
      />

      {/* Confetti */}
      <Confetti active={stage === 'display'} colors={[rankColor, '#ffffff', '#ffd700']} />

      {/* Level up content */}
      <div
        className={cn(
          'relative flex flex-col items-center gap-6 transition-all duration-500',
          stage === 'enter' && 'scale-50 opacity-0',
          stage === 'display' && 'scale-100 opacity-100',
          stage === 'exit' && 'scale-150 opacity-0'
        )}
      >
        {/* Glow effect */}
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: `${rankColor}40` }}
        />

        {/* Level up text */}
        <div className="relative z-10 text-center">
          <div className="text-2xl font-bold text-white/80 mb-2 animate-bounce">
            LEVEL UP!
          </div>

          {/* Level number with animated ring */}
          <div className="relative">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center border-4 relative"
              style={{
                borderColor: rankColor,
                backgroundColor: `${rankColor}20`,
              }}
            >
              <span
                className="text-5xl font-bold"
                style={{ color: rankColor }}
              >
                {newLevel}
              </span>

              {/* Rotating ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderTopColor: rankColor,
                  borderRightColor: `${rankColor}50`,
                  animationDuration: '2s',
                }}
              />
            </div>

            {/* Expanding rings */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border-2 animate-ping"
                style={{
                  borderColor: `${rankColor}${30 - i * 10}`,
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '1.5s',
                }}
              />
            ))}
          </div>

          <div className="mt-4 text-lg text-white/60">
            Keep grinding!
          </div>
        </div>
      </div>
    </div>
  );
}

export default LevelUpCelebration;
