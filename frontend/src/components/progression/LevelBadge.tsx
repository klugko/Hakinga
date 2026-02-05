import { cn } from '@/lib/utils';
import type { RankTier } from '@/types';
import { RANK_COLORS } from '@/types';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  rankTier?: RankTier;
  showGlow?: boolean;
  className?: string;
}

export function LevelBadge({
  level,
  size = 'md',
  rankTier = 'unranked',
  showGlow = false,
  className,
}: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const rankColor = RANK_COLORS[rankTier];

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full font-bold',
        'border-2 transition-all duration-300',
        sizeClasses[size],
        showGlow && 'shadow-lg',
        className
      )}
      style={{
        borderColor: rankColor,
        backgroundColor: `${rankColor}20`,
        color: rankColor,
        boxShadow: showGlow ? `0 0 20px ${rankColor}50` : undefined,
      }}
    >
      <span className="font-mono">{level}</span>

      {/* Decorative ring for higher tiers */}
      {['gold', 'platinum', 'diamond', 'master', 'grandmaster'].includes(rankTier) && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            border: `1px solid ${rankColor}40`,
            transform: 'scale(1.2)',
          }}
        />
      )}
    </div>
  );
}

export default LevelBadge;
