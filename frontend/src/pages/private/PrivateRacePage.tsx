import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Trophy, ArrowLeft, Loader2, Wifi, WifiOff, Gauge, Target, Clock } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Card, Avatar, Badge } from '@/components/ui';
import { TypingArea, Countdown } from '@/components/typing';
import { useTypingSession } from '@/hooks/useTypingSession';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { privateSessionService, PrivateSessionWebSocket } from '@/services';
import { cn, formatTime } from '@/lib/utils';
import type { Player, TypingSession } from '@/types';
import type { PrivateSession, WebSocketMessage } from '@/services/privateSessionService';

function PrivateRacePage() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const token = localStorage.getItem('hakinga_token');
  const { error: toastError, info } = useToast();

  // State from navigation or fetch
  const [session, setSession] = useState<PrivateSession | null>(
    (location.state as { session?: PrivateSession })?.session || null
  );
  const [players, setPlayers] = useState<Player[]>(
    (location.state as { players?: Player[] })?.players || []
  );

  const [isLoading, setIsLoading] = useState(!session);
  const [isConnected, setIsConnected] = useState(false);
  const [racePhase, setRacePhase] = useState<'countdown' | 'racing' | 'finished'>('countdown');
  const [finalResults, setFinalResults] = useState<Player[] | null>(null);

  const wsRef = useRef<PrivateSessionWebSocket | null>(null);
  const lastProgressRef = useRef({ progress: 0, wpm: 0, accuracy: 100 });

  // Fetch session if not provided via navigation state
  useEffect(() => {
    if (session || !code) return;

    const fetchSession = async () => {
      try {
        const sessionData = await privateSessionService.getSession(code);
        setSession(sessionData);
        setPlayers(sessionData.players);
      } catch (err) {
        console.error('Failed to fetch session:', err);
        toastError('Session not found');
        navigate('/private/create');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [code, session, navigate, toastError]);

  // Handle race completion
  const handleComplete = useCallback((result: Partial<TypingSession>) => {
    wsRef.current?.sendFinished(result.wpm || 0, result.accuracy || 0);

    // Update own player progress to 100%
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
    text: session?.textContent || '',
    onComplete: handleComplete,
  });

  // Handle keyboard events
  useEffect(() => {
    if (racePhase !== 'racing') return;

    const handleKey = (e: KeyboardEvent) => {
      if (!isStarted && racePhase === 'racing') {
        start();
      }
      handleKeyDown(e);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [racePhase, isStarted, start, handleKeyDown]);

  // Send progress updates via WebSocket (throttled)
  useEffect(() => {
    if (racePhase !== 'racing') return;

    const last = lastProgressRef.current;

    // Only send if there's significant change
    if (Math.abs(progress - last.progress) >= 2 ||
        Math.abs(wpm - last.wpm) >= 5 ||
        Math.abs(accuracy - last.accuracy) >= 2) {
      wsRef.current?.sendProgress(progress, wpm, accuracy);
      lastProgressRef.current = { progress, wpm, accuracy };

      // Update own progress in local state
      setPlayers(prev => prev.map(p =>
        p.id === user?.id
          ? { ...p, progress, wpm, accuracy }
          : p
      ));
    }
  }, [progress, wpm, accuracy, racePhase, user?.id]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'player_progress':
        setPlayers(prev => prev.map(p =>
          p.id === message.player_id
            ? { ...p, progress: message.progress, wpm: message.wpm, accuracy: message.accuracy }
            : p
        ));
        break;

      case 'player_finished':
        setPlayers(prev => prev.map(p =>
          p.id === message.player_id
            ? { ...p, progress: 100, wpm: message.wpm, accuracy: message.accuracy, position: message.position }
            : p
        ));
        info(`A player finished in position ${message.position}!`);
        break;

      case 'player_left':
        setPlayers(prev => prev.filter(p => p.id !== message.player_id));
        break;

      case 'race_ended':
        setFinalResults(message.results);
        setRacePhase('finished');
        break;

      default:
        break;
    }
  }, [info]);

  // Connect WebSocket
  useEffect(() => {
    if (!code || !token || isLoading) return;

    const ws = privateSessionService.createWebSocket(code, token);
    wsRef.current = ws;

    const unsubMessage = ws.onMessage(handleWebSocketMessage);
    const unsubConnection = ws.onConnectionChange(setIsConnected);

    ws.connect();

    return () => {
      unsubMessage();
      unsubConnection();
      ws.disconnect();
    };
  }, [code, token, isLoading, handleWebSocketMessage]);

  const handleBackToLobby = () => {
    wsRef.current?.disconnect();
    navigate('/private/create');
  };

  const handleCountdownComplete = () => {
    setRacePhase('racing');
    start();
  };

  // Sort players by progress/position for display
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (a.position && b.position) return a.position - b.position;
      if (a.position) return -1;
      if (b.position) return 1;
      return (b.progress || 0) - (a.progress || 0);
    });
  }, [players]);

  // Get current user's result
  const myResult = players.find(p => p.id === user?.id);

  if (isLoading || !session) {
    return (
      <Layout showFooter={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#22c55e] mx-auto mb-4" />
            <p className="text-[#a1a1aa]">Loading race...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show finished state
  if (racePhase === 'finished') {
    const rankedPlayers = finalResults || sortedPlayers.map((p, i) => ({ ...p, position: i + 1 }));

    return (
      <Layout showFooter={false}>
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f59e0b]/20 rounded-full mb-6">
              <Trophy className="w-10 h-10 text-[#f59e0b]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Race Complete!</h2>

            {myResult && (
              <div className="mb-8">
                <p className="text-[#a1a1aa] mb-4">Your Results</p>
                <div className="flex justify-center gap-8">
                  <div>
                    <div className="text-4xl font-bold text-[#22c55e]">{myResult.wpm}</div>
                    <div className="text-sm text-[#a1a1aa]">WPM</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-[#8b5cf6]">{myResult.accuracy?.toFixed(1)}%</div>
                    <div className="text-sm text-[#a1a1aa]">Accuracy</div>
                  </div>
                </div>
              </div>
            )}

            {/* Final Standings */}
            <Card variant="bordered" padding="lg" className="max-w-md mx-auto mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Final Standings</h3>
              <div className="space-y-2">
                {rankedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg',
                      index === 0 && 'bg-[#f59e0b]/10 border border-[#f59e0b]/30',
                      index === 1 && 'bg-[#a1a1aa]/10 border border-[#a1a1aa]/30',
                      index === 2 && 'bg-[#cd7f32]/10 border border-[#cd7f32]/30',
                      index > 2 && 'bg-[#1a1a1a] border border-[#2a2a2a]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                        index === 0 && 'bg-[#f59e0b] text-black',
                        index === 1 && 'bg-[#a1a1aa] text-black',
                        index === 2 && 'bg-[#cd7f32] text-black',
                        index > 2 && 'bg-[#2a2a2a] text-white'
                      )}>
                        {index + 1}
                      </div>
                      <Avatar name={player.username} size="sm" />
                      <span className={cn(
                        'font-medium',
                        player.id === user?.id ? 'text-[#22c55e]' : 'text-white'
                      )}>
                        {player.username}
                        {player.id === user?.id && ' (You)'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-[#22c55e] font-medium">{player.wpm} WPM</div>
                      <div className="text-xs text-[#a1a1aa]">{player.accuracy?.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/private/lobby/${code}`)}
              >
                Race Again
              </Button>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<ArrowLeft className="w-5 h-5" />}
                onClick={handleBackToLobby}
              >
                Back to Lobby
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      {/* Countdown overlay */}
      {racePhase === 'countdown' && <Countdown onComplete={handleCountdownComplete} />}

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Private Race</h1>
            <Badge variant="default">Code: {code}</Badge>
          </div>

          <div className={cn(
            'flex items-center gap-1.5 text-sm',
            isConnected ? 'text-[#22c55e]' : 'text-[#ef4444]'
          )}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Reconnecting...</span>
              </>
            )}
          </div>
        </div>

        {/* Race Progress Bars */}
        <Card variant="bordered" padding="md" className="mb-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#f59e0b]" />
            Race Progress
          </h3>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center gap-4">
                {/* Position/Avatar */}
                <div className="flex items-center gap-2 w-36">
                  {player.position ? (
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      player.position === 1 && 'bg-[#f59e0b] text-black',
                      player.position === 2 && 'bg-[#a1a1aa] text-black',
                      player.position === 3 && 'bg-[#cd7f32] text-black',
                      player.position > 3 && 'bg-[#2a2a2a] text-white'
                    )}>
                      {player.position}
                    </div>
                  ) : (
                    <div className="w-6 h-6 flex items-center justify-center text-[#71717a] text-xs">
                      {index + 1}
                    </div>
                  )}
                  <Avatar name={player.username} size="sm" />
                  <span className={cn(
                    'text-sm truncate',
                    player.id === user?.id ? 'text-[#22c55e] font-medium' : 'text-white'
                  )}>
                    {player.username}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 h-6 bg-[#1a1a1a] rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      player.position ? 'bg-[#22c55e]' : 'bg-[#8b5cf6]',
                      player.id === user?.id && !player.position && 'bg-[#22c55e]'
                    )}
                    style={{ width: `${player.progress || 0}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end pr-2">
                    <span className="text-xs text-white/80">
                      {player.progress?.toFixed(0) || 0}%
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 w-28 text-sm">
                  <span className="text-[#22c55e]">{player.wpm || 0}</span>
                  <span className="text-[#a1a1aa]">{player.accuracy?.toFixed(0) || 100}%</span>
                </div>
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
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-[#3b82f6]" />
              <span className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</span>
            </div>
            <p className="text-xs text-[#71717a]">Time</p>
          </Card>
        </div>

        {/* Typing area */}
        <TypingArea
          characters={characters}
          currentIndex={currentIndex}
          isActive={racePhase === 'racing'}
          className="min-h-[180px]"
        />
      </div>
    </Layout>
  );
}

export { PrivateRacePage };
