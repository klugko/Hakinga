import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Medal, Gauge, Target, Crown, Wifi, WifiOff } from 'lucide-react';
import { Layout } from '@/components/layout';
import { TypingArea } from '@/components/typing';
import { Card, Progress, Avatar, Badge, Button } from '@/components/ui';
import { useTypingSession } from '@/hooks/useTypingSession';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { cn, formatTime } from '@/lib/utils';
import type { TypingSession } from '@/types';

interface Player {
  id: string;
  username: string;
  avatar: string | null;
  progress: number;
  wpm: number;
  accuracy: number;
  position: number | null;
  finished_at: string | null;
}

interface LocationState {
  sessionId: string;
  textContent: string;
  players: Player[];
}

type RacePhase = 'racing' | 'finished';

function RacePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { info } = useToast();
  const token = localStorage.getItem('hakinga_token');

  // Get data from navigation state
  const locationState = location.state as LocationState | null;
  const [textContent] = useState(locationState?.textContent || '');
  const [players, setPlayers] = useState<Player[]>(locationState?.players || []);
  const [phase, setPhase] = useState<RacePhase>('racing');
  const [isConnected, setIsConnected] = useState(true);
  const [finalResults, setFinalResults] = useState<Player[] | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const lastProgressRef = useRef({ progress: 0, wpm: 0, accuracy: 100 });

  // Redirect if no session data
  useEffect(() => {
    if (!locationState) {
      navigate('/competition');
    }
  }, [locationState, navigate]);

  // Handle session completion
  const handleComplete = useCallback((result: Partial<TypingSession>) => {
    // Send finished message
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'finished',
        wpm: result.wpm || 0,
        accuracy: result.accuracy || 0,
      }));
    }

    // Update own player progress
    setPlayers(prev => prev.map(p =>
      p.id === user?.id
        ? { ...p, progress: 100, wpm: result.wpm || 0, accuracy: result.accuracy || 0 }
        : p
    ));
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
    text: textContent,
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

  // Send progress updates
  useEffect(() => {
    if (phase !== 'racing') return;

    const last = lastProgressRef.current;

    // Only send if there's significant change
    if (Math.abs(progress - last.progress) >= 2 ||
        Math.abs(wpm - last.wpm) >= 5 ||
        Math.abs(accuracy - last.accuracy) >= 2) {

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'progress',
          progress,
          wpm,
          accuracy,
        }));
      }

      lastProgressRef.current = { progress, wpm, accuracy };

      // Update own progress locally
      setPlayers(prev => prev.map(p =>
        p.id === user?.id
          ? { ...p, progress, wpm, accuracy }
          : p
      ));
    }
  }, [progress, wpm, accuracy, phase, user?.id]);

  // Handle WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'player_progress':
          setPlayers(prev => prev.map(p =>
            p.id === data.player_id
              ? { ...p, progress: data.progress, wpm: data.wpm, accuracy: data.accuracy }
              : p
          ));
          break;

        case 'player_finished':
          setPlayers(prev => prev.map(p =>
            p.id === data.player_id
              ? { ...p, progress: 100, wpm: data.wpm, accuracy: data.accuracy, position: data.position }
              : p
          ));
          if (data.player_id === user?.id) {
            setPointsEarned(data.points_earned || 0);
          }
          info(`A player finished in position ${data.position}!`);
          break;

        case 'race_ended':
          setFinalResults(data.results);
          setPhase('finished');
          break;
      }
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  }, [user?.id, info]);

  // Connect to existing WebSocket (from matchmaking)
  useEffect(() => {
    // The WebSocket should already be connected from CompetitionPage
    // We need to reconnect with the same session
    if (!token || !locationState?.sessionId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
    const wsUrl = `${protocol}//${host}/api/v1/public-sessions/queue?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Auto-start typing
    setTimeout(() => {
      start();
    }, 500);

    return () => {
      ws.close();
    };
  }, [token, locationState?.sessionId, handleMessage, start]);

  // Sort players by progress/position for display
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.position && b.position) return a.position - b.position;
    if (a.position) return -1;
    if (b.position) return 1;
    return (b.progress || 0) - (a.progress || 0);
  });

  const myResult = players.find(p => p.id === user?.id);

  // Render finished state
  if (phase === 'finished') {
    const rankedPlayers = finalResults || sortedPlayers.map((p, i) => ({ ...p, position: i + 1 }));

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
              You finished in position #{myResult?.position || '-'}
            </p>
            {pointsEarned > 0 && (
              <p className="text-[#22c55e] text-xl font-bold mt-2">
                +{pointsEarned} points earned!
              </p>
            )}
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
                    <span className="text-[#22c55e]">{player.accuracy?.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" onClick={() => navigate('/competition')}>
              Find New Race
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Public Race</h1>
          </div>

          <div className={cn(
            'flex items-center gap-1.5 text-sm',
            isConnected ? 'text-[#22c55e]' : 'text-[#ef4444]'
          )}>
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Race Progress */}
        <Card variant="bordered" padding="md" className="mb-4">
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
                  {player.position || index + 1}
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
                    value={player.progress || 0}
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
        <div className="grid grid-cols-3 gap-4 mb-4">
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
