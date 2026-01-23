import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Keyboard,
  Play,
  Zap,
  Target,
  Clock,
  Code,
  BookOpen,
  Quote,
  Wrench,
} from 'lucide-react';
import type { Difficulty, TextLength, TextCategory } from '@/types';

const difficulties: Array<{ value: Difficulty; label: string; description: string; icon: typeof Zap }> = [
  { value: 'easy', label: 'Facile', description: 'Mots simples et courants', icon: Target },
  { value: 'medium', label: 'Moyen', description: 'Vocabulaire varie', icon: Keyboard },
  { value: 'hard', label: 'Difficile', description: 'Mots complexes et techniques', icon: Zap },
];

const lengths: Array<{ value: TextLength; label: string; words: string; duration: string }> = [
  { value: 'short', label: 'Court', words: '50 mots', duration: '~1 min' },
  { value: 'medium', label: 'Moyen', words: '100 mots', duration: '~2 min' },
  { value: 'long', label: 'Long', words: '200 mots', duration: '~4 min' },
];

const categories: Array<{ value: TextCategory; label: string; icon: typeof Code }> = [
  { value: 'prose', label: 'Prose', icon: BookOpen },
  { value: 'code', label: 'Code', icon: Code },
  { value: 'technical', label: 'Technique', icon: Wrench },
  { value: 'quote', label: 'Citations', icon: Quote },
];

/**
 * Solo practice configuration page
 */
export function SoloPracticePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [length, setLength] = useState<TextLength>('medium');
  const [category, setCategory] = useState<TextCategory | null>(null);
  const navigate = useNavigate();

  const handleStart = () => {
    const params = new URLSearchParams({
      difficulty,
      length,
      ...(category && { category }),
    });
    navigate(`/solo/session?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Keyboard className="w-5 h-5 text-primary" />
          <span className="text-primary font-medium">Pratique Solo</span>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">Configurez votre session</h1>
        <p className="text-text-secondary">
          Choisissez les parametres qui correspondent a vos objectifs
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Difficulte</CardTitle>
            <CardDescription>Selectionnez le niveau de complexite du texte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {difficulties.map((d) => {
                const Icon = d.icon;
                const isSelected = difficulty === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary/20' : 'bg-surface-hover'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                      </div>
                      <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-text'}`}>
                        {d.label}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">{d.description}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Longueur</CardTitle>
            <CardDescription>Choisissez la duree approximative de la session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lengths.map((l) => {
                const isSelected = length === l.value;
                return (
                  <button
                    key={l.value}
                    onClick={() => setLength(l.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-text'}`}>
                        {l.label}
                      </span>
                      <Badge variant={isSelected ? 'primary' : 'default'}>{l.words}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Clock className="w-4 h-4" />
                      <span>{l.duration}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorie (optionnel)</CardTitle>
            <CardDescription>Filtrez par type de texte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setCategory(isSelected ? null : c.value)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-text'}`}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            <div>
              <h3 className="font-semibold text-text">Configuration selectionnee</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="primary">{difficulties.find(d => d.value === difficulty)?.label}</Badge>
                <Badge variant="default">{lengths.find(l => l.value === length)?.words}</Badge>
                {category && <Badge variant="info">{categories.find(c => c.value === category)?.label}</Badge>}
              </div>
            </div>
            <Button size="lg" rightIcon={<Play className="w-5 h-5" />} onClick={handleStart}>
              Commencer la session
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
