import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Copy, Check, Crown, ArrowLeft, Play, User } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Card, Avatar, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { mockPlayers, sleep, cn } from '@/lib/utils';
import type { Player } from '@/types';

function PrivateSessionLobbyPage() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const { success, info } = useToast();

  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState<Player[]>([
    {
      id: user?.id || '1',
      username: user?.username || 'You',
      isHost: true,
      isReady: false,
      progress: 0,
      wpm: 0,
      accuracy: 100,
    },
  ]);

  // Simulate players joining
  useEffect(() => {
    const timers: number[] = [];

    // Add players over time
    mockPlayers.slice(1).forEach((player, index) => {
      const timer = window.setTimeout(() => {
        setPlayers(prev => {
          if (prev.find(p => p.id === player.id)) return prev;
          info(`${player.username} joined the lobby`);
          return [...prev, { ...player, isHost: false }];
        });
      }, (index + 1) * 2000);
      timers.push(timer);
    });

    // Simulate other players becoming ready
    const readyTimer = window.setTimeout(() => {
      setPlayers(prev => prev.map(p =>
        p.id !== user?.id && Math.random() > 0.3
          ? { ...p, isReady: true }
          : p
      ));
    }, 6000);
    timers.push(readyTimer);

    return () => timers.forEach(t => clearTimeout(t));
  }, [user?.id, info]);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code || '');
    setCopied(true);
    success('Session code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    setIsReady(!isReady);
    setPlayers(prev => prev.map(p =>
      p.id === user?.id ? { ...p, isReady: !isReady } : p
    ));
  };

  const handleStartRace = () => {
    navigate(`/private/race/${code}`);
  };

  const handleLeave = () => {
    navigate('/private/create');
  };

  const allReady = players.every(p => p.isReady);
  const isHost = players.find(p => p.id === user?.id)?.isHost;

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

          <div className="flex items-center gap-2">
            <span className="text-[#a1a1aa]">Session Code:</span>
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
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

        {/* Main Content */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#22c55e]/20 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Waiting Room</h1>
          <p className="text-[#a1a1aa] mt-1">
            {players.length} player{players.length > 1 ? 's' : ''} in lobby
          </p>
        </div>

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
            {Array.from({ length: 4 - players.length }).map((_, i) => (
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
          >
            {isReady ? 'Cancel Ready' : 'Ready Up'}
          </Button>

          {isHost && (
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5" />}
              onClick={handleStartRace}
              disabled={!allReady || players.length < 2}
            >
              Start Race
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
