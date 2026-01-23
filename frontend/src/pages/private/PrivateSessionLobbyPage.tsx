import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Countdown } from '@/components/typing/Countdown';
import { useToast } from '@/contexts/ToastContext';
import {
  Users,
  Copy,
  Check,
  Play,
  Crown,
  ArrowLeft,
} from 'lucide-react';

interface Participant {
  id: string;
  username: string;
  isHost: boolean;
  isReady: boolean;
}

/**
 * Private session lobby page
 */
export function PrivateSessionLobbyPage() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', username: user?.username || 'Vous', isHost: true, isReady: false },
  ]);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  const isHost = participants.find((p) => p.id === '1')?.isHost;
  const allReady = participants.length >= 2 && participants.every((p) => p.isReady || p.isHost);

  useEffect(() => {
    const timer = setTimeout(() => {
      setParticipants((prev) => [
        ...prev,
        { id: '2', username: 'SpeedTyper', isHost: false, isReady: false },
      ]);
    }, 2000);

    const timer2 = setTimeout(() => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === '2' ? { ...p, isReady: true } : p))
      );
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/session/private/${code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    success('Lien copie !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    setIsReady(!isReady);
    setParticipants((prev) =>
      prev.map((p) => (p.id === '1' ? { ...p, isReady: !isReady } : p))
    );
  };

  const handleStart = () => {
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    navigate(`/session/private/${code}/race`);
  };

  if (showCountdown) {
    return <Countdown seconds={3} onComplete={handleCountdownComplete} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
          <Users className="w-5 h-5 text-success" />
          <span className="text-success font-medium">Session Privee</span>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">Salle d'attente</h1>
        <p className="text-text-secondary">En attente des autres joueurs</p>
      </div>

      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Code de la session</p>
              <p className="text-2xl font-mono font-bold text-primary">{code}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copie' : 'Copier le lien'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Joueurs ({participants.length}/5)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 rounded-lg bg-surface-hover"
              >
                <div className="flex items-center gap-3">
                  <Avatar fallback={participant.username} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{participant.username}</span>
                      {participant.isHost && (
                        <Crown className="w-4 h-4 text-gold" />
                      )}
                      {participant.id === '1' && (
                        <Badge variant="primary" size="sm">Vous</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={participant.isReady || participant.isHost ? 'success' : 'default'}
                >
                  {participant.isHost ? 'Hote' : participant.isReady ? 'Pret' : 'En attente'}
                </Badge>
              </div>
            ))}

            {participants.length < 5 && (
              <div className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-border">
                <p className="text-text-muted">En attente de joueurs...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        {isHost ? (
          <Button
            size="lg"
            fullWidth
            disabled={!allReady}
            leftIcon={<Play className="w-5 h-5" />}
            onClick={handleStart}
          >
            {allReady ? 'Demarrer la course' : 'En attente des joueurs...'}
          </Button>
        ) : (
          <Button
            size="lg"
            fullWidth
            variant={isReady ? 'secondary' : 'primary'}
            leftIcon={isReady ? <Check className="w-5 h-5" /> : undefined}
            onClick={handleToggleReady}
          >
            {isReady ? 'Pret !' : 'Je suis pret'}
          </Button>
        )}
      </div>

      {isHost && !allReady && participants.length >= 2 && (
        <p className="text-center text-sm text-text-muted mt-4">
          Tous les joueurs doivent etre prets pour demarrer
        </p>
      )}
    </div>
  );
}
