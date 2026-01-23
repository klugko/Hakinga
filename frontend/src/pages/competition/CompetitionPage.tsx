import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
  Zap,
  Users,
  Trophy,
  Target,
  Keyboard,
  Search,
  X,
} from 'lucide-react';
import type { Difficulty } from '@/types';

const difficulties: Array<{ value: Difficulty; label: string; description: string }> = [
  { value: 'easy', label: 'Facile', description: 'Joueurs debutants' },
  { value: 'medium', label: 'Moyen', description: 'Joueurs intermediaires' },
  { value: 'hard', label: 'Difficile', description: 'Joueurs experimentes' },
];

/**
 * Competition page for public matchmaking
 */
export function CompetitionPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [isSearching, setIsSearching] = useState(false);
  const [playersFound, setPlayersFound] = useState(1);
  const navigate = useNavigate();

  const handleStartSearch = () => {
    setIsSearching(true);
    setPlayersFound(1);

    const interval = setInterval(() => {
      setPlayersFound((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/competition/race?session=demo');
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setPlayersFound(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
          <Zap className="w-5 h-5 text-accent" />
          <span className="text-accent font-medium">Competition Publique</span>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">Affrontez d'autres joueurs</h1>
        <p className="text-text-secondary">
          Rejoignez une course et mesurez-vous aux meilleurs dactylographes
        </p>
      </div>

      {isSearching ? (
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-surface-hover" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-text mb-2">Recherche d'adversaires...</h2>
            <p className="text-text-secondary mb-6">
              Difficulte : {difficulties.find((d) => d.value === selectedDifficulty)?.label}
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-lg font-medium text-text">
                {playersFound}/5 joueurs trouves
              </span>
            </div>

            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    i <= playersFound
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-surface-hover border-2 border-border'
                  }`}
                >
                  {i <= playersFound ? (
                    <Keyboard className="w-5 h-5 text-primary" />
                  ) : (
                    <span className="text-text-muted">?</span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-text-muted mt-6">
              La course demarrera automatiquement quand 5 joueurs seront trouves
              <br />
              ou apres 60 secondes (minimum 2 joueurs)
            </p>

            <Button
              variant="outline"
              className="mt-8"
              leftIcon={<X className="w-4 h-4" />}
              onClick={handleCancelSearch}
            >
              Annuler la recherche
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Selectionnez votre niveau</CardTitle>
              <CardDescription>
                Vous serez mis en competition avec des joueurs de niveau similaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {difficulties.map((d) => {
                  const isSelected = selectedDifficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      onClick={() => setSelectedDifficulty(d.value)}
                      className={`p-6 rounded-lg border-2 text-center transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-border-hover'
                      }`}
                    >
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        isSelected ? 'bg-primary/20' : 'bg-surface-hover'
                      }`}>
                        {d.value === 'easy' && <Target className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />}
                        {d.value === 'medium' && <Keyboard className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />}
                        {d.value === 'hard' && <Zap className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />}
                      </div>
                      <h3 className={`font-semibold text-lg ${isSelected ? 'text-primary' : 'text-text'}`}>
                        {d.label}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">{d.description}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">Pret a vous mesurer ?</h3>
                  <p className="text-sm text-text-secondary">
                    Gagnez des points et grimpez dans le classement
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                leftIcon={<Search className="w-5 h-5" />}
                onClick={handleStartSearch}
              >
                Trouver une course
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Points par position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { rank: 1, points: 50, color: 'text-gold', bg: 'bg-gold/10' },
                  { rank: 2, points: 30, color: 'text-silver', bg: 'bg-silver/10' },
                  { rank: 3, points: 20, color: 'text-bronze', bg: 'bg-bronze/10' },
                  { rank: 4, points: 10, color: 'text-text-secondary', bg: 'bg-surface-hover' },
                  { rank: 5, points: 5, color: 'text-text-muted', bg: 'bg-surface-hover' },
                ].map((item) => (
                  <div key={item.rank} className={`${item.bg} rounded-lg p-4 text-center`}>
                    <p className={`text-2xl font-bold ${item.color}`}>#{item.rank}</p>
                    <p className="text-sm text-text-secondary mt-1">+{item.points} pts</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
