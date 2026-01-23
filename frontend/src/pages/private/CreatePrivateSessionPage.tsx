import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/contexts/ToastContext';
import {
  Users,
  Copy,
  Check,
  Play,
  Keyboard,
  Target,
  Zap,
  Clock,
} from 'lucide-react';
import type { Difficulty, TextLength } from '@/types';

const difficulties: Array<{ value: Difficulty; label: string }> = [
  { value: 'easy', label: 'Facile' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hard', label: 'Difficile' },
];

const lengths: Array<{ value: TextLength; label: string; words: string }> = [
  { value: 'short', label: 'Court', words: '50 mots' },
  { value: 'medium', label: 'Moyen', words: '100 mots' },
  { value: 'long', label: 'Long', words: '200 mots' },
];

/**
 * Create private session page
 */
export function CreatePrivateSessionPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [length, setLength] = useState<TextLength>('medium');
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { success } = useToast();
  const navigate = useNavigate();

  const handleCreate = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setSessionCode(code);
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/session/private/${sessionCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    success('Lien copie !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    navigate(`/session/private/${sessionCode}`);
  };

  if (sessionCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
            <Check className="w-5 h-5 text-success" />
            <span className="text-success font-medium">Session creee</span>
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Votre session est prete</h1>
          <p className="text-text-secondary">Partagez le lien avec vos amis</p>
        </div>

        <Card className="mb-6">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-text-muted mb-2">Code de la session</p>
            <p className="text-4xl font-mono font-bold text-primary tracking-wider mb-6">
              {sessionCode}
            </p>

            <div className="flex items-center gap-2 max-w-md mx-auto">
              <Input
                value={`${window.location.origin}/session/private/${sessionCode}`}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copie' : 'Copier'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-surface-hover">
                <p className="text-sm text-text-muted mb-1">Difficulte</p>
                <Badge>{difficulties.find((d) => d.value === difficulty)?.label}</Badge>
              </div>
              <div className="text-center p-4 rounded-lg bg-surface-hover">
                <p className="text-sm text-text-muted mb-1">Longueur</p>
                <Badge>{lengths.find((l) => l.value === length)?.words}</Badge>
              </div>
              <div className="text-center p-4 rounded-lg bg-surface-hover">
                <p className="text-sm text-text-muted mb-1">Joueurs max</p>
                <Badge>{maxParticipants}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button size="lg" rightIcon={<Play className="w-5 h-5" />} onClick={handleStart}>
            Acceder au lobby
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
          <Users className="w-5 h-5 text-success" />
          <span className="text-success font-medium">Session Privee</span>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">Creer une session</h1>
        <p className="text-text-secondary">Configurez et invitez vos amis a jouer</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Difficulte</CardTitle>
            <CardDescription>Niveau de complexite du texte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {difficulties.map((d) => {
                const isSelected = difficulty === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 ${
                      isSelected ? 'bg-primary/20' : 'bg-surface-hover'
                    }`}>
                      {d.value === 'easy' && <Target className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />}
                      {d.value === 'medium' && <Keyboard className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />}
                      {d.value === 'hard' && <Zap className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />}
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-primary' : 'text-text'}`}>
                      {d.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Longueur</CardTitle>
            <CardDescription>Duree approximative de la session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {lengths.map((l) => {
                const isSelected = length === l.value;
                return (
                  <button
                    key={l.value}
                    onClick={() => setLength(l.value)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <span className={`font-medium block ${isSelected ? 'text-primary' : 'text-text'}`}>
                      {l.label}
                    </span>
                    <span className="text-sm text-text-muted">{l.words}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nombre de joueurs</CardTitle>
            <CardDescription>Maximum de participants (2-10)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="10"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-2xl font-bold text-primary w-12 text-center">
                {maxParticipants}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button size="lg" fullWidth onClick={handleCreate}>
          Creer la session
        </Button>
      </div>
    </div>
  );
}
