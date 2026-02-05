import { useState, useCallback, useRef, useMemo } from 'react';
import type { ComboState, ComboTier, ComboTierConfig } from '@/types';
import { COMBO_TIERS } from '@/types';

interface UseComboSystemOptions {
  onMilestone?: (tier: ComboTier, combo: number) => void;
  onComboBreak?: (finalCombo: number, maxCombo: number) => void;
}

interface UseComboSystemReturn {
  combo: ComboState;
  incrementCombo: () => void;
  breakCombo: () => void;
  resetCombo: () => void;
  getTierConfig: () => ComboTierConfig;
  isAtMilestone: () => boolean;
  getNextMilestone: () => number | null;
}

function getComboTier(combo: number): ComboTier {
  if (combo >= COMBO_TIERS.legendary.threshold) return 'legendary';
  if (combo >= COMBO_TIERS.unstoppable.threshold) return 'unstoppable';
  if (combo >= COMBO_TIERS.incredible.threshold) return 'incredible';
  if (combo >= COMBO_TIERS.amazing.threshold) return 'amazing';
  if (combo >= COMBO_TIERS.great.threshold) return 'great';
  if (combo >= COMBO_TIERS.nice.threshold) return 'nice';
  return 'none';
}

function getNextTier(currentTier: ComboTier): ComboTier | null {
  const tierOrder: ComboTier[] = ['none', 'nice', 'great', 'amazing', 'incredible', 'unstoppable', 'legendary'];
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex >= tierOrder.length - 1) return null;
  return tierOrder[currentIndex + 1];
}

export function useComboSystem(options: UseComboSystemOptions = {}): UseComboSystemReturn {
  const { onMilestone, onComboBreak } = options;

  const [combo, setCombo] = useState<ComboState>({
    current: 0,
    max: 0,
    tier: 'none',
    isActive: false,
  });

  const previousTierRef = useRef<ComboTier>('none');

  const incrementCombo = useCallback(() => {
    setCombo(prev => {
      const newCurrent = prev.current + 1;
      const newMax = Math.max(prev.max, newCurrent);
      const newTier = getComboTier(newCurrent);

      // Check for milestone (tier change)
      if (newTier !== previousTierRef.current && newTier !== 'none') {
        previousTierRef.current = newTier;
        onMilestone?.(newTier, newCurrent);
      }

      return {
        current: newCurrent,
        max: newMax,
        tier: newTier,
        isActive: true,
      };
    });
  }, [onMilestone]);

  const breakCombo = useCallback(() => {
    setCombo(prev => {
      if (prev.current > 0) {
        onComboBreak?.(prev.current, prev.max);
      }
      previousTierRef.current = 'none';
      return {
        ...prev,
        current: 0,
        tier: 'none',
        isActive: false,
      };
    });
  }, [onComboBreak]);

  const resetCombo = useCallback(() => {
    previousTierRef.current = 'none';
    setCombo({
      current: 0,
      max: 0,
      tier: 'none',
      isActive: false,
    });
  }, []);

  const helpers = useMemo(() => ({
    getTierConfig: (): ComboTierConfig => {
      return COMBO_TIERS[combo.tier];
    },

    isAtMilestone: (): boolean => {
      const tierThresholds = Object.values(COMBO_TIERS)
        .map(t => t.threshold)
        .filter(t => t > 0);
      return tierThresholds.includes(combo.current);
    },

    getNextMilestone: (): number | null => {
      const nextTier = getNextTier(combo.tier);
      if (!nextTier) return null;
      return COMBO_TIERS[nextTier].threshold;
    },
  }), [combo]);

  return {
    combo,
    incrementCombo,
    breakCombo,
    resetCombo,
    ...helpers,
  };
}

export default useComboSystem;
