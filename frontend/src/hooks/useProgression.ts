import { useProgression as useProgressionContext } from '@/contexts/ProgressionContext';
import { useMemo } from 'react';
import type { RankTier } from '@/types';
import { RANK_COLORS } from '@/types';

/**
 * Hook for accessing progression data with computed helpers
 */
export function useProgression() {
  const context = useProgressionContext();

  const helpers = useMemo(() => {
    const { progress } = context;

    return {
      // Get the color for current rank tier
      getRankColor: (tier?: RankTier): string => {
        return RANK_COLORS[tier || progress?.rankTier || 'unranked'];
      },

      // Format XP with K suffix for large numbers
      formatXP: (xp: number): string => {
        if (xp >= 1000000) {
          return `${(xp / 1000000).toFixed(1)}M`;
        }
        if (xp >= 1000) {
          return `${(xp / 1000).toFixed(1)}K`;
        }
        return xp.toString();
      },

      // Calculate XP needed for a specific level
      xpForLevel: (level: number): number => {
        if (level <= 1) return 0;
        return Math.floor(100 * Math.pow(level, 1.8));
      },

      // Get progress percentage to next level
      levelProgress: (): number => {
        return progress?.levelInfo?.progressPercent || 0;
      },

      // Check if user is on a streak
      hasStreak: (): boolean => {
        return (progress?.currentStreak || 0) > 0;
      },

      // Get streak bonus percentage
      streakBonus: (): number => {
        const streak = progress?.currentStreak || 0;
        return Math.min(streak * 10, 100); // Max 100%
      },
    };
  }, [context]);

  return {
    ...context,
    ...helpers,
  };
}

export default useProgression;
