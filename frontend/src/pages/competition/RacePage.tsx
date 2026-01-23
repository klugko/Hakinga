import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTypingSession } from '@/hooks/useTypingSession';
import { TypingArea } from '@/components/typing/TypingArea';
import { Countdown } from '@/components/typing/Countdown';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn, getRankColor, formatDuration } from '@/lib/utils';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
} from 'lucide-react';

interface Player {
  id: string;
  username: string;
  progress: number;
  wpm: number;
  finished: boolean;
  rank?: number;
}

const SAMPLE_TEXT = 'La competition de dactylographie est un excellent moyen d\'ameliorer sa vitesse de frappe. Chaque course vous permet de vous mesurer a d\'autres joueurs et de progresser. Restez concentre et tapez avec precision pour obtenir le meilleur score.';

const mockPlayers: Player[] = [
  { id: '1', username: 'Vous', progress: 0, wpm: 0, finished: false },
  { id: '2', username: 'SpeedTyper', progress: 0, wpm: 0, finished: false },
  { id: '3', username: 'KeyMaster', progress: 0, wpm: 0, finished: false },
  { id: '4', username: 'FlashFingers', progress: 0, wpm: 0, finished: false },
  { id: '5', username: 'TypeNinja', progress: 0, wpm: 0, finished: false },
];

/**
 * Live race page for competition
 */
export function RacePage() {
  const [showCountdown, setShowCountdown] = useState(true);
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [raceFinished, setRaceFinished] = useState(false);
  const [finalResults, setFinalResults] = useState<Player[]>([]);
  const navigate = useNavigate();

  const handleComplete = useCallback((result: { wpm: number; accuracy: number }) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === '1'
          ? { ...p, finished: true, wpm: Math.round(result.wpm), progress: 100 }
          : p
      )
    );
  }, []);

  const handleProgress = useCallback((progress: number, wpm: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === '1' ? { ...p, progress, wpm: Math.round(wpm) } : p
      )
    );
  }, []);

  const {
    charStates,
    currentIndex,
    isFinished,
    handleKeyDown,
  } = useTypingSession({
    text: SAMPLE_TEXT,
    onComplete: handleComplete,
    onProgress: handleProgress,
  });

  useEffect(() => {
    if (showCountdown) return;

    const interval = setInterval(() => {
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === '1' || p.finished) return p;

          const speedMultiplier = 0.5 + Math.random() * 0.5;
          const newProgress = Math.min(100, p.progress + (2 + Math.random() * 2) * speedMultiplier);
          const newWpm = 60 + Math.floor(Math.random() * 40);

          return {
            ...p,
            progress: newProgress,
            wpm: newWpm,
            finished: newProgress >= 100,
          };
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [showCountdown]);

  useEffect(() => {
    const allFinished = players.every((p) => p.finished);
    if (allFinished && !raceFinished) {
      const sorted = [...players].sort((a, b) => {
        if (a.finished && !b.finished) return -1;
        if (!a.finished && b.finished) return 1;
        return b.wpm - a.wpm;
      });

      const ranked = sorted.map((p, index) => ({ ...p, rank: index + 1 }));
      setFinalResults(ranked);
      setRaceFinished(true);
    }
  }, [players, raceFinished]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-silver" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-bronze" />;
    return null;
  };

  const getPointsForRank = (rank: number) => {
    const points: Record<number, number> = { 1: 50, 2: 30, 3: 20, 4: 10, 5: 5 };
    return points[rank] ?? 0;
  };

  if (showCountdown) {
    return <Countdown seconds={3} onComplete={() => setShowCountdown(false)} />;
  }

  if (raceFinished) {
    const userResult = finalResults.find((p) => p.id === '1');

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full animate-slide-up">
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-gold mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text mb-2">Course terminee !</h1>
            <p className="text-text-secondary">
              Voici le classement final
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {finalResults.map((player) => {
              const isUser = player.id === '1';
              const points = getPointsForRank(player.rank || 5);

              return (
                <div
                  key={player.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                    player.rank === 1 && 'bg-gold/10 border-gold/30',
                    player.rank === 2 && 'bg-silver/10 border-silver/30',
                    player.rank === 3 && 'bg-bronze/10 border-bronze/30',
                    player.rank && player.rank > 3 && 'bg-surface-hover border-transparent',
                    isUser && 'ring-2 ring-primary'
                  )}
                >
                  <div className="w-10 text-center">
                    {getRankIcon(player.rank || 5) || (
                      <span className="text-lg font-bold text-text-muted">#{player.rank}</span>
                    )}
                  </div>

                  <Avatar fallback={player.username} size="md" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-semibold', isUser && 'text-primary')}>
                        {player.username}
                      </span>
                      {isUser && <Badge variant="primary" size="sm">Vous</Badge>}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-text">{player.wpm} WPM</p>
                  </div>

                  <div className="text-right min-w-[60px]">
                    <Badge variant={player.rank === 1 ? 'warning' : 'success'}>
                      +{points} pts
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/competition" className="flex-1">
              <Button fullWidth size="lg">
                Nouvelle course
              </Button>
            </Link>
            <Link to="/dashboard" className="flex-1">
              <Button variant="outline" fullWidth size="lg">
                Retour au dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              to="/competition"
              className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quitter</span>
            </Link>

            <div className="flex items-center gap-2">
              <Badge variant="error">EN DIRECT</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 p-4 rounded-lg bg-surface border border-border">
            <h3 className="text-sm font-medium text-text-secondary mb-3">Classement en direct</h3>
            <div className="space-y-2">
              {[...players]
                .sort((a, b) => b.progress - a.progress)
                .map((player, index) => {
                  const isUser = player.id === '1';
                  return (
                    <div key={player.id} className="flex items-center gap-3">
                      <span className={cn(
                        'w-6 text-sm font-bold',
                        index === 0 && 'text-gold',
                        index === 1 && 'text-silver',
                        index === 2 && 'text-bronze',
                        index > 2 && 'text-text-muted'
                      )}>
                        #{index + 1}
                      </span>
                      <Avatar fallback={player.username} size="sm" />
                      <span className={cn(
                        'text-sm font-medium flex-shrink-0 w-24 truncate',
                        isUser && 'text-primary'
                      )}>
                        {player.username}
                      </span>
                      <div className="flex-1">
                        <Progress
                          value={player.progress}
                          variant={isUser ? 'gradient' : 'default'}
                          size="sm"
                        />
                      </div>
                      <span className="text-sm font-medium text-text w-16 text-right">
                        {player.wpm} WPM
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          <TypingArea
            charStates={charStates}
            currentIndex={currentIndex}
            onKeyDown={handleKeyDown}
            disabled={isFinished}
          />
        </div>
      </main>
    </div>
  );
}
