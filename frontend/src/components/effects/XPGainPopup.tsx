import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { XPBreakdown, RankTier } from '@/types';
import { RANK_COLORS } from '@/types';

interface XPGainPopupProps {
  xpBreakdown: XPBreakdown;
  rankTier?: RankTier;
  isVisible: boolean;
  onComplete?: () => void;
  position?: 'center' | 'top-right' | 'bottom-right';
}

export function XPGainPopup({
  xpBreakdown,
  rankTier = 'unranked',
  isVisible,
  onComplete,
  position = 'center',
}: XPGainPopupProps) {
  const [stage, setStage] = useState<'enter' | 'display' | 'exit' | 'hidden'>('hidden');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const rankColor = RANK_COLORS[rankTier];

  useEffect(() => {
    if (isVisible) {
      setStage('enter');
      setShowBreakdown(false);
      const timer1 = setTimeout(() => setStage('display'), 200);
      const timer2 = setTimeout(() => setShowBreakdown(true), 500);
      const timer3 = setTimeout(() => setStage('exit'), 3000);
      const timer4 = setTimeout(() => {
        setStage('hidden');
        onComplete?.();
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isVisible, onComplete]);

  if (stage === 'hidden') return null;

  const positionClasses = {
    center: 'fixed inset-0 flex items-center justify-center',
    'top-right': 'fixed top-4 right-4',
    'bottom-right': 'fixed bottom-4 right-4',
  };

  const bonusItems = [
    { label: 'Base XP', value: xpBreakdown.baseXp, show: true },
    {
      label: 'Difficulty',
      value: `×${xpBreakdown.difficultyMultiplier.toFixed(1)}`,
      show: xpBreakdown.difficultyMultiplier > 1,
    },
    {
      label: 'Mode Bonus',
      value: `×${xpBreakdown.modeMultiplier.toFixed(1)}`,
      show: xpBreakdown.modeMultiplier > 1,
    },
    {
      label: 'Streak Bonus',
      value: `+${xpBreakdown.streakBonus}`,
      show: xpBreakdown.streakBonus > 0,
      highlight: true,
    },
    {
      label: 'Perfect!',
      value: `+${xpBreakdown.perfectAccuracyBonus}`,
      show: xpBreakdown.perfectAccuracyBonus > 0,
      highlight: true,
    },
    {
      label: 'New PB!',
      value: `+${xpBreakdown.personalBestBonus}`,
      show: xpBreakdown.personalBestBonus > 0,
      highlight: true,
    },
  ].filter(item => item.show);

  return (
    <div className={cn(positionClasses[position], 'z-50 pointer-events-none')}>
      <div
        className={cn(
          'bg-background/95 backdrop-blur-sm border rounded-lg shadow-2xl p-6 min-w-[200px]',
          'transition-all duration-300',
          stage === 'enter' && 'scale-50 opacity-0 translate-y-4',
          stage === 'display' && 'scale-100 opacity-100 translate-y-0',
          stage === 'exit' && 'scale-75 opacity-0 -translate-y-8'
        )}
        style={{ borderColor: `${rankColor}50` }}
      >
        {/* XP Header */}
        <div className="text-center mb-4">
          <div className="text-sm text-muted-foreground mb-1">XP GAINED</div>
          <div
            className="text-4xl font-bold animate-pulse"
            style={{ color: rankColor }}
          >
            +{xpBreakdown.totalXp}
          </div>
        </div>

        {/* Breakdown */}
        {showBreakdown && (
          <div className="space-y-2 border-t pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {bonusItems.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  'flex items-center justify-between text-sm',
                  'animate-in fade-in slide-in-from-left duration-200'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span
                  className={cn(
                    'font-mono',
                    item.highlight ? 'text-green-500 font-semibold' : 'text-foreground'
                  )}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float"
              style={{
                backgroundColor: rankColor,
                left: `${20 + i * 15}%`,
                top: '50%',
                animationDelay: `${i * 100}ms`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default XPGainPopup;
