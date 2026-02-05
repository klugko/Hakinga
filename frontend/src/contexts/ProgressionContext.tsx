import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { UserProgress, LevelInfo, XPBreakdown } from '@/types';
import { progressionService } from '@/services';
import { useAuth } from './AuthContext';

interface XPGainEvent {
  xpBreakdown: XPBreakdown;
  levelInfo: LevelInfo;
  leveledUp: boolean;
  newLevel?: number;
  newStreak: number;
}

interface ProgressionContextType {
  progress: UserProgress | null;
  isLoading: boolean;
  error: string | null;
  refreshProgress: () => Promise<void>;
  notifyXPGain: (event: XPGainEvent) => void;
  lastXPGain: XPGainEvent | null;
  clearLastXPGain: () => void;
}

const ProgressionContext = createContext<ProgressionContextType | null>(null);

export function useProgression() {
  const context = useContext(ProgressionContext);
  if (!context) {
    throw new Error('useProgression must be used within a ProgressionProvider');
  }
  return context;
}

interface ProgressionProviderProps {
  children: ReactNode;
}

export function ProgressionProvider({ children }: ProgressionProviderProps) {
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastXPGain, setLastXPGain] = useState<XPGainEvent | null>(null);

  const refreshProgress = useCallback(async () => {
    if (!isAuthenticated) {
      setProgress(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await progressionService.getMyProgress();
      setProgress(data);
    } catch (err) {
      console.error('Failed to fetch progression:', err);
      setError(err instanceof Error ? err.message : 'Failed to load progression');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load progress when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshProgress();
    } else {
      setProgress(null);
    }
  }, [isAuthenticated, refreshProgress]);

  const notifyXPGain = useCallback((event: XPGainEvent) => {
    setLastXPGain(event);

    // Update local progress state
    if (progress && event.levelInfo) {
      setProgress(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          totalXp: event.levelInfo.currentXp,
          currentLevel: event.levelInfo.level,
          currentStreak: event.newStreak,
          levelInfo: event.levelInfo,
        };
      });
    }
  }, [progress]);

  const clearLastXPGain = useCallback(() => {
    setLastXPGain(null);
  }, []);

  return (
    <ProgressionContext.Provider
      value={{
        progress,
        isLoading,
        error,
        refreshProgress,
        notifyXPGain,
        lastXPGain,
        clearLastXPGain,
      }}
    >
      {children}
    </ProgressionContext.Provider>
  );
}
