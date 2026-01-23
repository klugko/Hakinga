import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, Medal, Gauge, Target, Crown } from 'lucide-react';
import { Layout } from '@/components/layout';
import { TypingArea, Countdown } from '@/components/typing';
import { Card, Progress, Avatar, Badge, Button } from '@/components/ui';
import { useTypingSession } from '@/hooks/useTypingSession';
import { useAuth } from '@/contexts/AuthContext';
import { mockTexts, mockPlayers, cn, formatTime } from '@/lib/utils';
import type { Player, TypingSession } from '@/types';

type RacePhase = 'countdown' | 'racing' | 'finished';

function RacePage() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();

  const [phase, setPhase] = useState<RacePhase>('countdown');
  const [text] = useState(() => mockTexts[4]); // Medium difficulty text
  const [players, setPlayers] = useState<Player[]>(() => [
    {
      id: user?.id || '1',
      username: user?.username || 'You',
      isHost: true,
      isReady: true,
      progress: 0,
      wpm: 0,
      accuracy: 100,
    },
    ...mockPlayers.slice(1, 4).map(p => ({ ...p, progress: 0, wpm: 0, accuracy: 100 })),
  ]);
  const [sessionResult, setSessionResult] = useState<Partial<TypingSession> | null>(null);

  // Handle session completion
  const handleComplete = useCallback((result: Partial<TypingSession>) => {
    setSessionResult(result);
    setPlayers(prev => prev.map(p =>
      p.id === user?.id
        ? { ...p, progress: 100, wpm: result.wpm || 0, accuracy: result.accuracy || 0, position: 1 }
        : p
    ));
    // Small delay before showing results
    setTimeout(() => setPhase('finished'), 1000);
  }, [user?.id]);

  // Typing session hook
  const {
    characters,
    currentIndex,
    isStarted,
    wpm,
    accuracy,
    elapsedTime,
    handleKeyDown,
    start,
    progress,
  } = useTypingSession({
    text: text.content,
    onComplete: handleComplete,
  });

  // Handle keyboard events
  useEffect(() => {
    if (phase !== 'racing') return;

    const handleKey = (e: KeyboardEvent) => {
      if (!isStarted && phase === 'racing') {
        start();
      }
      handleKeyDown(e);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, isStarted, start, handleKeyDown]);

  // Update own progress
  useEffect(() => {
    if (phase === 'racing') {
      setPlayers(prev => prev.map(p =>
        p.id === user?.id
          ? { ...p, progress, wpm, accuracy }
          : p
      ));
    }
  }, [progress, wpm, accuracy, user?.id, phase]);

  // Simulate other players' progress
  useEffect(() => {
    if (phase !== 'racing') return;

    const interval = setInterval(() => {
      setPlayers(prev => prev.map(p => {
        if (p.id === user?.id || p.progress >= 100) return p;

        // Random progress increase based on "skill"
        const baseSpeed = 0.5 + Math.random() * 1.5;
        const newProgress = Math.min(100, p.progress + baseSpeed);
        const newWpm = 60 + Math.floor(Math.random() * 40);

        return {
          ...p,
          progress: newProgress,
          wpm: newWpm,
          accuracy: 90 + Math.floor(Math.random() * 10),
        };
      }));
    }, 200);

    return () => clearInterval(interval);
  }, [phase, user?.id]);

  // Sort players by progress
  const sortedPlayers = [...players].sort((a, b) => b.progress - a.progress);

  // Handle countdown complete
  const handleCountdownComplete = () => {
    setPhase('racing');
    start();
  };

  // Render finished state
  if (phase === 'finished') {
    const rankedPlayers = sortedPlayers.map((p, i) => ({ ...p, position: i + 1 }));
    const userResult = rankedPlayers.find(p => p.id === user?.id);

    return (
      <Layout showFooter={false}>
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f59e0b]/20 rounded-full mb-4">
              <Trophy className="w-10 h-10 text-[#f59e0b]" />
            </div>
            <h1 className="text-3xl font-bold text-white">Race Complete!</h1>
            <p className="text-[#a1a1aa] mt-1">
              You finished in position #{userResult?.position || 1}
            </p>
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            {rankedPlayers[1] && (
              <div className="text-center">
                <Avatar name={rankedPlayers[1].username} size="lg" className="mx-auto mb-2" />
                <p className="font-medium text-white text-sm">{rankedPlayers[1].username}</p>
                <div className="w-24 h-20 bg-[#a1a1aa]/20 rounded-t-lg flex items-center justify-center mt-2">
                  <Medal className="w-8 h-8 text-[#a1a1aa]" />
                </div>
              </div>
            )}

            {/* 1st Place */}
            {rankedPlayers[0] && (
              <div className="text-center">
                <Crown className="w-8 h-8 text-[#f59e0b] mx-auto mb-2" />
                <Avatar name={rankedPlayers[0].username} size="xl" className="mx-auto mb-2" />
                <p className="font-medium text-white">{rankedPlayers[0].username}</p>
                <div className="w-28 h-28 bg-[#f59e0b]/20 rounded-t-lg flex items-center justify-center mt-2">
                  <Trophy className="w-10 h-10 text-[#f59e0b]" />
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {rankedPlayers[2] && (
              <div className="text-center">
                <Avatar name={rankedPlayers[2].username} size="lg" className="mx-auto mb-2" />
                <p className="font-medium text-white text-sm">{rankedPlayers[2].username}</p>
                <div className="w-24 h-16 bg-[#b45309]/20 rounded-t-lg flex items-center justify-center mt-2">
                  <Medal className="w-6 h-6 text-[#b45309]" />
                </div>
              </div>
            )}
          </div>

          {/* Full Results */}
          <Card variant="bordered" padding="lg" className="mb-8">
            <h3 className="font-semibold text-white mb-4">Final Results</h3>
            <div className="space-y-3">
              {rankedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    player.id === user?.id ? 'bg-[#8b5cf6]/10 border border-[#8b5cf6]/30' : 'bg-[#1a1a1a]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                      index === 0 ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                      index === 1 ? 'bg-[#a1a1aa]/20 text-[#a1a1aa]' :
                      index === 2 ? 'bg-[#b45309]/20 text-[#b45309]' :
                      'bg-[#2a2a2a] text-[#71717a]'
                    )}>
                      {index + 1}
                    </span>
                    <Avatar name={player.username} size="sm" />
                    <span className="font-medium text-white">
                      {player.username}
                      {player.id === user?.id && <Badge variant="primary" size="sm" className="ml-2">You</Badge>}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white font-medium">{player.wpm} WPM</span>
                    <span className="text-[#22c55e]">{player.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" onClick={() => navigate(`/private/lobby/${code}`)}>
              Race Again
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/private/create')}>
              Back to Lobby
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      {/* Countdown overlay */}
      {phase === 'countdown' && <Countdown onComplete={handleCountdownComplete} />}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Race Progress */}
        <Card variant="bordered" padding="md" className="mb-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#f59e0b]" />
            Race Progress
          </h3>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center gap-3">
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  index === 0 ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-[#2a2a2a] text-[#71717a]'
                )}>
                  {index + 1}
                </span>
                <Avatar name={player.username} size="sm" />
                <span className={cn(
                  'w-24 truncate text-sm',
                  player.id === user?.id ? 'text-[#8b5cf6] font-medium' : 'text-white'
                )}>
                  {player.username}
                </span>
                <div className="flex-1">
                  <Progress
                    value={player.progress}
                    size="md"
                    variant={player.id === user?.id ? 'default' : 'success'}
                  />
                </div>
                <span className="text-sm text-white w-16 text-right">{player.wpm} WPM</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card variant="bordered" padding="sm" className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Gauge className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-2xl font-bold text-white">{wpm}</span>
            </div>
            <p className="text-xs text-[#71717a]">WPM</p>
          </Card>

          <Card variant="bordered" padding="sm" className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Target className="w-4 h-4 text-[#22c55e]" />
              <span className="text-2xl font-bold text-white">{accuracy}%</span>
            </div>
            <p className="text-xs text-[#71717a]">Accuracy</p>
          </Card>

          <Card variant="bordered" padding="sm" className="text-center">
            <span className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</span>
            <p className="text-xs text-[#71717a]">Time</p>
          </Card>
        </div>

        {/* Typing area */}
        <TypingArea
          characters={characters}
          currentIndex={currentIndex}
          isActive={phase === 'racing'}
          className="min-h-[200px]"
        />
      </div>
    </Layout>
  );
}

export { RacePage };
