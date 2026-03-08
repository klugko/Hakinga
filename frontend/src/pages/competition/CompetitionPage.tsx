import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Users, Zap, ArrowRight, Loader2, X, Wifi, WifiOff } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, Button, Badge, Select, Avatar } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';

type QueueStatus = 'idle' | 'searching' | 'matched' | 'countdown' | 'racing';

interface QueuePlayer {
  id: string;
  username: string;
  avatar: string | null;
  progress?: number;
  wpm?: number;
  accuracy?: number;
  position?: number | null;
}

interface MatchData {
  session_id: string;
  text_content: string;
  text_id: string;
  players: QueuePlayer[];
}

function CompetitionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: toastError, success } = useToast();
  const token = localStorage.getItem('hakinga_token');

  const [status, setStatus] = useState<QueueStatus>('idle');
  const [difficulty, setDifficulty] = useState('medium');
  const [queueSize, setQueueSize] = useState(0);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'queue_joined':
          setStatus('searching');
          setQueueSize(data.queue_size);
          break;

        case 'queue_update':
          setQueueSize(data.queue_size);
          setQueuePosition(data.position);
          break;

        case 'queue_left':
          setStatus('idle');
          break;

        case 'queue_timeout':
          toastError(data.message || 'Queue timeout. Please try again.');
          setStatus('idle');
          break;

        case 'match_found':
          setStatus('matched');
          setMatchData({
            session_id: data.session_id,
            text_content: data.text_content,
            text_id: data.text_id,
            players: data.players,
          });
          success('Match found! Get ready...');
          break;

        case 'countdown':
          setStatus('countdown');
          setCountdown(data.value);
          break;

        case 'race_started':
          setStatus('racing');
          setCountdown(null);
          // Navigate to race page with match data
          if (matchData) {
            navigate('/competition/race', {
              state: {
                sessionId: matchData.session_id,
                textContent: matchData.text_content,
                players: matchData.players,
              },
            });
          }
          break;

        case 'error':
          toastError(data.message || 'An error occurred');
          setStatus('idle');
          break;
      }
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  }, [matchData, navigate, success, toastError]);

  const connectToQueue = useCallback(() => {
    if (!token) {
      toastError('Please log in to join a race');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
    const wsUrl = `${protocol}//${host}/api/v1/public-sessions/queue?token=${token}&difficulty=${difficulty}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      setIsConnected(false);
      if (status === 'searching') {
        setStatus('idle');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toastError('Connection error. Please try again.');
      setStatus('idle');
    };
  }, [token, difficulty, handleMessage, status, toastError]);

  const handleJoinQueue = () => {
    setStatus('searching');
    connectToQueue();
  };

  const handleCancelSearch = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'cancel' }));
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('idle');
    setQueuePosition(null);
    setQueueSize(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update matchData state for navigation
  useEffect(() => {
    if (status === 'racing' && matchData) {
      navigate('/competition/race', {
        state: {
          sessionId: matchData.session_id,
          textContent: matchData.text_content,
          players: matchData.players,
        },
      });
    }
  }, [status, matchData, navigate]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f59e0b]/20 rounded-2xl mb-4">
            <Trophy className="w-8 h-8 text-[#f59e0b]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Competition</h1>
          <p className="text-[#a1a1aa] mt-1">
            Race against other typists in real-time competitions
          </p>
        </div>

        {/* Searching Overlay */}
        {(status === 'searching' || status === 'matched' || status === 'countdown') && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card variant="bordered" padding="lg" className="max-w-md w-full mx-4 text-center">
              {status === 'searching' && (
                <>
                  <Loader2 className="w-16 h-16 animate-spin text-[#f59e0b] mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">Finding Opponents...</h2>
                  <p className="text-[#a1a1aa] mb-2">Difficulty: {difficulty}</p>

                  <div className="flex items-center justify-center gap-2 mb-6">
                    {isConnected ? (
                      <Wifi className="w-4 h-4 text-[#22c55e]" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-[#ef4444]" />
                    )}
                    <span className="text-[#a1a1aa]">
                      {queueSize} player{queueSize !== 1 ? 's' : ''} in queue
                    </span>
                    {queuePosition && (
                      <span className="text-[#71717a]">
                        (Position: {queuePosition})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#71717a] mb-6">
                    Looking for 2-5 players. Max wait time: 60 seconds.
                  </p>

                  <Button
                    variant="secondary"
                    leftIcon={<X className="w-4 h-4" />}
                    onClick={handleCancelSearch}
                  >
                    Cancel Search
                  </Button>
                </>
              )}

              {status === 'matched' && (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#22c55e]/20 rounded-full mb-6">
                    <Users className="w-8 h-8 text-[#22c55e]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Match Found!</h2>

                  {matchData && (
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                      {matchData.players.map((player) => (
                        <div
                          key={player.id}
                          className={cn(
                            'flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2',
                            player.id === user?.id && 'border border-[#22c55e]'
                          )}
                        >
                          <Avatar name={player.username} size="sm" />
                          <span className="text-white text-sm">{player.username}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[#a1a1aa]">Get ready to race...</p>
                </>
              )}

              {status === 'countdown' && countdown !== null && (
                <>
                  <div className="text-8xl font-bold text-[#f59e0b] mb-6 animate-pulse">
                    {countdown}
                  </div>
                  <h2 className="text-2xl font-bold text-white">Race Starting!</h2>
                </>
              )}
            </Card>
          </div>
        )}

        {/* Quick Join */}
        <Card variant="bordered" padding="lg" className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Zap className="w-12 h-12 text-[#f59e0b]" />
            <div>
              <h2 className="text-xl font-semibold text-white">Quick Join</h2>
              <p className="text-[#a1a1aa]">
                Jump into the next available race instantly
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              options={[
                { value: 'easy', label: 'Easy - Common words' },
                { value: 'medium', label: 'Medium - Mixed vocabulary' },
                { value: 'hard', label: 'Hard - Complex text' },
              ]}
              className="sm:w-64"
            />
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Zap className="w-5 h-5" />}
              onClick={handleJoinQueue}
              disabled={status !== 'idle'}
            >
              Find Match
            </Button>
          </div>
        </Card>

        {/* How it Works */}
        <Card variant="bordered" padding="lg" className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">How Public Races Work</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#8b5cf6] font-bold">1</span>
              </div>
              <h3 className="font-medium text-white mb-1">Join Queue</h3>
              <p className="text-sm text-[#a1a1aa]">Select difficulty and join the matchmaking queue</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#8b5cf6] font-bold">2</span>
              </div>
              <h3 className="font-medium text-white mb-1">Get Matched</h3>
              <p className="text-sm text-[#a1a1aa]">2-5 players matched automatically within 60s</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#8b5cf6] font-bold">3</span>
              </div>
              <h3 className="font-medium text-white mb-1">Race & Win</h3>
              <p className="text-sm text-[#a1a1aa]">Type fastest to win! Top 3 earn bonus points</p>
            </div>
          </div>
        </Card>

        {/* Points System */}
        <Card variant="bordered" padding="lg" className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Points System</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="warning" size="md">1st Place: +50 pts</Badge>
            <Badge variant="default" size="md">2nd Place: +30 pts</Badge>
            <Badge variant="default" size="md">3rd Place: +20 pts</Badge>
            <Badge variant="default" size="md">4th Place: +10 pts</Badge>
            <Badge variant="default" size="md">5th Place: +5 pts</Badge>
          </div>
        </Card>

        {/* Private Race */}
        <Card variant="bordered" padding="lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#22c55e]/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#22c55e]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Private Race</h3>
                <p className="text-[#a1a1aa]">Create a private room and invite your friends</p>
              </div>
            </div>
            <Link to="/private/create">
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Room
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export { CompetitionPage };
