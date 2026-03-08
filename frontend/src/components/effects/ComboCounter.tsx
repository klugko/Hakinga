import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ComboState, ComboTierConfig } from '@/types';
import { COMBO_TIERS } from '@/types';

const PARTICLE_POSITIONS = [35, 42, 50, 58, 65];

interface ComboCounterProps {
  combo: ComboState;
  showMilestoneAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ComboCounter({
  combo,
  showMilestoneAnimation = true,
  size = 'md',
  className,
}: ComboCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastTier, setLastTier] = useState(combo.tier);

  const particlePositions = useMemo(() => PARTICLE_POSITIONS, []);

  const tierConfig: ComboTierConfig = COMBO_TIERS[combo.tier];

  // Detect tier changes for milestone animation
  useEffect(() => {
    if (combo.tier !== lastTier && combo.tier !== 'none') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      setLastTier(combo.tier);
      return () => clearTimeout(timer);
    }
    setLastTier(combo.tier);
  }, [combo.tier, lastTier]);

  if (combo.current === 0) return null;

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  const getAnimationClass = () => {
    if (!isAnimating || !showMilestoneAnimation) return '';

    switch (tierConfig.animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      case 'scale':
        return 'animate-scale-pop';
      case 'shake':
        return 'animate-shake';
      case 'fire':
        return 'animate-fire';
      case 'rainbow':
        return 'animate-rainbow';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 font-bold transition-all duration-200',
        getAnimationClass(),
        className
      )}
    >
      {/* Combo number */}
      <div
        className={cn(
          'font-mono tracking-tight relative',
          sizeClasses[size]
        )}
        style={{ color: tierConfig.color }}
      >
        {combo.current}x

        {/* Glow effect for high combos */}
        {combo.current >= 50 && (
          <div
            className="absolute inset-0 blur-lg opacity-50"
            style={{ color: tierConfig.color }}
          >
            {combo.current}x
          </div>
        )}
      </div>

      {/* Tier label */}
      {tierConfig.label && (
        <div
          className={cn(
            'font-bold tracking-wider',
            labelSizeClasses[size],
            isAnimating && 'animate-bounce'
          )}
          style={{ color: tierConfig.color }}
        >
          {tierConfig.label}
        </div>
      )}

      {tierConfig.animation === 'fire' && combo.isActive && (
        <div className="absolute -inset-4 pointer-events-none">
          {particlePositions.map((position, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-fire-particle"
              style={{
                backgroundColor: tierConfig.color,
                left: `${position}%`,
                bottom: 0,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes scale-pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fire {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.1) translateY(-5px); }
        }
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes fire-particle {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-30px) scale(0); opacity: 0; }
        }
        .animate-scale-pop { animation: scale-pop 0.5s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out infinite; }
        .animate-fire { animation: fire 0.5s ease-in-out infinite; }
        .animate-rainbow { animation: rainbow 2s linear infinite; }
        .animate-fire-particle { animation: fire-particle 0.8s ease-out infinite; }
      `}</style>
    </div>
  );
}

export default ComboCounter;
