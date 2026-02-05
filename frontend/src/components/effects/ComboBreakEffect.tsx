import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ComboBreakEffectProps {
  isVisible: boolean;
  brokenCombo: number;
  onComplete?: () => void;
}

export function ComboBreakEffect({
  isVisible,
  brokenCombo,
  onComplete,
}: ComboBreakEffectProps) {
  const [stage, setStage] = useState<'enter' | 'display' | 'exit' | 'hidden'>('hidden');

  useEffect(() => {
    if (isVisible && brokenCombo > 0) {
      setStage('enter');
      const timer1 = setTimeout(() => setStage('display'), 100);
      const timer2 = setTimeout(() => setStage('exit'), 800);
      const timer3 = setTimeout(() => {
        setStage('hidden');
        onComplete?.();
      }, 1200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, brokenCombo, onComplete]);

  if (stage === 'hidden' || brokenCombo === 0) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      {/* Screen flash */}
      <div
        className={cn(
          'absolute inset-0 bg-red-500/10 transition-opacity duration-200',
          stage === 'enter' && 'opacity-100',
          stage === 'display' && 'opacity-50',
          stage === 'exit' && 'opacity-0'
        )}
      />

      {/* Combo break text */}
      <div
        className={cn(
          'text-center transition-all duration-300',
          stage === 'enter' && 'scale-150 opacity-0',
          stage === 'display' && 'scale-100 opacity-100',
          stage === 'exit' && 'scale-50 opacity-0 translate-y-8'
        )}
      >
        <div className="text-2xl font-bold text-red-500 animate-shake">
          COMBO BREAK!
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          Lost {brokenCombo}x combo
        </div>
      </div>

      {/* Shatter particles */}
      <div className="absolute inset-0 overflow-hidden">
        {stage === 'display' && [...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const distance = 100 + Math.random() * 100;
          return (
            <div
              key={i}
              className="absolute w-3 h-3 bg-red-500 rounded-sm animate-shatter"
              style={{
                left: '50%',
                top: '50%',
                '--tx': `${Math.cos(angle) * distance}px`,
                '--ty': `${Math.sin(angle) * distance}px`,
                animationDelay: `${i * 30}ms`,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes shatter {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-shatter {
          animation: shatter 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default ComboBreakEffect;
