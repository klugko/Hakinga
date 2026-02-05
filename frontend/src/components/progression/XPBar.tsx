import { cn } from '@/lib/utils';
import type { LevelInfo, RankTier } from '@/types';
import { RANK_COLORS } from '@/types';
import { useMemo } from 'react';

interface XPBarProps {
  levelInfo: LevelInfo;
  rankTier?: RankTier;
  showNumbers?: boolean;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function XPBar({
  levelInfo,
  rankTier = 'unranked',
  showNumbers = true,
  showLevel = true,
  size = 'md',
  animated = true,
  className,
}: XPBarProps) {
  const rankColor = RANK_COLORS[rankTier];

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const formatXP = (xp: number): string => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  };

  const xpInCurrentLevel = levelInfo.currentXp - levelInfo.xpForCurrentLevel;
  const xpNeededForLevel = levelInfo.xpForNextLevel - levelInfo.xpForCurrentLevel;

  return (
    <div className={cn('w-full', className)}>
      {/* Labels */}
      {(showLevel || showNumbers) && (
        <div className="flex items-center justify-between mb-1 text-sm">
          {showLevel && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Level</span>
              <span className="font-bold" style={{ color: rankColor }}>
                {levelInfo.level}
              </span>
            </div>
          )}
          {showNumbers && (
            <div className="text-muted-foreground">
              <span style={{ color: rankColor }}>{formatXP(xpInCurrentLevel)}</span>
              <span className="mx-1">/</span>
              <span>{formatXP(xpNeededForLevel)} XP</span>
            </div>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-muted/30',
          sizeClasses[size]
        )}
      >
        {/* Progress fill */}
        <div
          className={cn(
            'h-full rounded-full relative overflow-hidden',
            animated && 'transition-all duration-500 ease-out'
          )}
          style={{
            width: `${Math.min(100, Math.max(0, levelInfo.progressPercent))}%`,
            backgroundColor: rankColor,
          }}
        >
          {/* Shine effect */}
          {animated && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
                animation: 'shine 2s infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* XP to next level */}
      {showNumbers && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {formatXP(levelInfo.xpNeeded)} XP to level {levelInfo.level + 1}
        </div>
      )}

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export default XPBar;
