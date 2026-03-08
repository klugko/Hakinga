import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Copy, Check, Crown, ArrowLeft, Play, User, Loader2, Wifi, WifiOff } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Card, Avatar, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { privateSessionService, PrivateSessionWebSocket } from '@/services';
import { cn } from '@/lib/utils';
import type { Player } from '@/types';
import type { PrivateSession, WebSocketMessage } from '@/services/privateSessionService';

function PrivateSessionLobbyPage() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const token = localStorage.getItem('hakinga_token');
  const { success, error: toastError, info } = useToast();

  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isTogglingReady, setIsTogglingReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState<PrivateSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  const wsRef = useRef<PrivateSessionWebSocket | null>(null);

  // Fetch session data on mount
  useEffect(() => {
    if (!code) {
      navigate('/private/create');
      return;
    }

    const fetchSession = async () => {
      try {
        const sessionData = await privateSessionService.getSession(code);
        setSession(sessionData);
        setPlayers(sessionData.players);

        // Check if current user is ready
        const currentPlayer = sessionData.players.find(p => p.id === user?.id);
        if (currentPlayer) {
          setIsReady(currentPlayer.isReady || false);
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
        toastError('Session not found or expired');
        navigate('/private/create');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [code, user?.id, navigate, toastError]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'player_joined': {
        // Map snake_case from backend to camelCase
        const playerData = message.player as Record<string, unknown>;
        const mappedPlayer: Player = {
          id: playerData.id as string,
          username: playerData.username as string,
          avatar: (playerData.avatar as string) || undefined,
          isHost: (playerData.is_host ?? playerData.isHost) as boolean,
          isReady: (playerData.is_ready ?? playerData.isReady) as boolean,
          progress: (playerData.progress as number) || 0,
          wpm: (playerData.wpm as number) || 0,
          accuracy: (playerData.accuracy as number) || 100,
          position: playerData.position as number | undefined,
          finishedAt: playerData.finished_at as string | undefined,
        };
        setPlayers(prev => {
          if (prev.find(p => p.id === mappedPlayer.id)) return prev;
          info(`${mappedPlayer.username} joined the lobby`);
          return [...prev, mappedPlayer];
        });
        break;
      }

      case 'player_left':
        setPlayers(prev => {
          const player = prev.find(p => p.id === message.player_id);
          if (player) {
            info(`${player.username} left the lobby`);
          }
          return prev.filter(p => p.id !== message.player_id);
        });
        break;

      case 'player_ready':
        setPlayers(prev => prev.map(p =>
          p.id === message.player_id
            ? { ...p, isReady: message.is_ready }
            : p
        ));
        break;

      case 'race_starting':
        setCountdown(message.countdown);
        break;

      case 'race_started':
        navigate(`/private/race/${code}`, {
          state: { session, players }
        });
        break;

      default:
        break;
    }
  }, [code, info, navigate, session, players]);

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

  const handleCopyCode = async () => {
    const textToCopy = code || '';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-HTTPS contexts
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      success('Session code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleToggleReady = async () => {
    if (!code) return;

    setIsTogglingReady(true);
    try {
      const result = await privateSessionService.toggleReady(code);
      setIsReady(result.isReady);
      setPlayers(prev => prev.map(p =>
        p.id === user?.id ? { ...p, isReady: result.isReady } : p
      ));
    } catch (err) {
      console.error('Failed to toggle ready:', err);
      toastError('Failed to update ready status');
    } finally {
      setIsTogglingReady(false);
    }
  };

  const handleStartRace = async () => {
    if (!code) return;

    setIsStarting(true);
    try {
      await privateSessionService.startRace(code);
      // Navigation will happen via WebSocket 'race_started' event
    } catch (err) {
      console.error('Failed to start race:', err);
      toastError('Failed to start the race');
      setIsStarting(false);
    }
  };

  const handleLeave = () => {
    wsRef.current?.disconnect();
    navigate('/private/create');
  };

  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#22c55e] mx-auto mb-4" />
            <p className="text-[#a1a1aa]">Loading lobby...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const allReady = players.length >= 2 && players.every(p => p.isReady);
  const isHost = players.find(p => p.id === user?.id)?.isHost;
  const maxPlayers = session?.maxPlayers || 4;

  return (
    <Layout showFooter={false}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleLeave}
          >
            Leave Lobby
          </Button>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
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

            {/* Session Code */}
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
              <span className="text-[#a1a1aa] text-sm">Code:</span>
              <span className="font-mono text-lg tracking-widest text-white">{code}</span>
              <button
                onClick={handleCopyCode}
                className="text-[#71717a] hover:text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-center">
              <p className="text-2xl text-white mb-4">Race starting in...</p>
              <div className="text-8xl font-bold text-[#22c55e] animate-pulse">
                {countdown}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#22c55e]/20 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Waiting Room</h1>
          <p className="text-[#a1a1aa] mt-1">
            {players.length} / {maxPlayers} player{players.length !== 1 ? 's' : ''} in lobby
          </p>
        </div>

        {/* Session Info */}
        {session && (
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant="default">
              Difficulty: {session.textDifficulty}
            </Badge>
          </div>
        )}

        {/* Players List */}
        <Card variant="bordered" padding="lg" className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Players</h2>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border transition-all',
                  player.isReady
                    ? 'bg-[#22c55e]/5 border-[#22c55e]/30'
                    : 'bg-[#1a1a1a] border-[#2a2a2a]'
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={player.username} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{player.username}</span>
                      {player.isHost && (
                        <Badge variant="warning" size="sm" className="flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Host
                        </Badge>
                      )}
                      {player.id === user?.id && (
                        <Badge variant="primary" size="sm">You</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Badge
                  variant={player.isReady ? 'success' : 'default'}
                  size="sm"
                >
                  {player.isReady ? 'Ready' : 'Not Ready'}
                </Badge>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center p-4 rounded-lg border border-dashed border-[#2a2a2a] text-[#71717a]"
              >
                <User className="w-5 h-5 mr-2" />
                Waiting for player...
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant={isReady ? 'secondary' : 'primary'}
            size="lg"
            onClick={handleToggleReady}
            disabled={isTogglingReady}
            leftIcon={isTogglingReady ? <Loader2 className="w-5 h-5 animate-spin" /> : undefined}
          >
            {isTogglingReady ? 'Updating...' : isReady ? 'Cancel Ready' : 'Ready Up'}
          </Button>

          {isHost && (
            <Button
              variant="primary"
              size="lg"
              leftIcon={isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              onClick={handleStartRace}
              disabled={!allReady || players.length < 2 || isStarting}
            >
              {isStarting ? 'Starting...' : 'Start Race'}
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {isHost && !allReady && players.length >= 2 && (
          <p className="text-center text-[#f59e0b] text-sm mt-4">
            Waiting for all players to be ready...
          </p>
        )}

        {isHost && players.length < 2 && (
          <p className="text-center text-[#a1a1aa] text-sm mt-4">
            Need at least 2 players to start the race
          </p>
        )}

        {!isHost && (
          <p className="text-center text-[#a1a1aa] text-sm mt-4">
            Waiting for the host to start the race...
          </p>
        )}
      </div>
    </Layout>
  );
}

export { PrivateSessionLobbyPage };
