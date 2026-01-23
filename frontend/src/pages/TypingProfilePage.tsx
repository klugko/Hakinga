import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingOverlay } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import { mlApi } from '@/lib/api';
import {
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  Zap,
  Keyboard,
  BarChart3,
  Activity,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import type { TypingProfile, WpmPrediction, CharacterError, DifficultSequence } from '@/types';

const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const SKILL_BADGES: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Debutant', color: 'text-text-muted' },
  novice: { label: 'Novice', color: 'text-accent' },
  intermediate: { label: 'Intermediaire', color: 'text-primary' },
  advanced: { label: 'Avance', color: 'text-success' },
  expert: { label: 'Expert', color: 'text-gold' },
};

/**
 * ML-based typing profile analysis page
 */
export function TypingProfilePage() {
  const { error: showError } = useToast();
  const [profile, setProfile] = useState<TypingProfile | null>(null);
  const [wpmPrediction, setWpmPrediction] = useState<WpmPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      const [profileData, predictionData] = await Promise.all([
        mlApi.getTypingProfile(),
        mlApi.getWpmPrediction().catch(() => null),
      ]);
      setProfile(profileData);
      setWpmPrediction(predictionData);
    } catch {
      showError('Erreur lors du chargement du profil');
      setProfile(createFallbackProfile());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProfile();
  };

  const getKeyHeatColor = (char: string) => {
    if (!profile) return 'bg-surface-hover';
    const problematic = profile.problematicChars.find(
      (c) => c.char.toUpperCase() === char
    );
    if (!problematic) return 'bg-surface-hover';
    if (problematic.rate > 0.06) return 'bg-error/40';
    if (problematic.rate > 0.04) return 'bg-warning/40';
    return 'bg-success/40';
  };

  if (isLoading) {
    return <LoadingOverlay message="Analyse de votre profil..." />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-text mb-4">Profil non disponible</h1>
        <p className="text-text-secondary mb-6">
          Completez quelques sessions pour generer votre profil de frappe.
        </p>
        <Link to="/solo">
          <Button>Commencer une session</Button>
        </Link>
      </div>
    );
  }

  const skillBadge = SKILL_BADGES[profile.skillBadge] || SKILL_BADGES.beginner;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="text-center flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Analyse ML</span>
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Votre profil de frappe</h1>
          <p className="text-text-secondary">
            Analyse detaillee basee sur vos sessions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          Actualiser
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardContent className="py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
            <p className="text-4xl font-bold text-text mb-1">{Math.round(profile.avgWpm)}</p>
            <p className="text-text-secondary">WPM Moyen</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <Target className="w-10 h-10 text-success" />
            </div>
            <p className="text-4xl font-bold text-text mb-1">{(profile.avgAccuracy * 100).toFixed(1)}%</p>
            <p className="text-text-secondary">Precision</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Activity className="w-10 h-10 text-accent" />
            </div>
            <p className="text-4xl font-bold text-text mb-1">{Math.round(profile.consistencyScore)}</p>
            <p className="text-text-secondary">Score de consistance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" />
              Heatmap du clavier
            </CardTitle>
            <CardDescription>Vos touches les plus problematiques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-2">
              {keyboardLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1" style={{ marginLeft: rowIndex * 20 }}>
                  {row.map((key) => (
                    <div
                      key={key}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-medium text-text ${getKeyHeatColor(
                        key
                      )}`}
                    >
                      {key}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-error/40" />
                <span className="text-xs text-text-secondary">Problematique</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-warning/40" />
                <span className="text-xs text-text-secondary">A ameliorer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/40" />
                <span className="text-xs text-text-secondary">Bon</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Repartition des erreurs
            </CardTitle>
            <CardDescription>Types d'erreurs detectees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Erreurs de vitesse', value: profile.errorBreakdown.speed, color: 'bg-primary' },
                { label: 'Erreurs cognitives', value: profile.errorBreakdown.cognitive, color: 'bg-accent' },
                { label: 'Erreurs motrices', value: profile.errorBreakdown.motor, color: 'bg-warning' },
                { label: 'Fatigue', value: profile.errorBreakdown.fatigue, color: 'bg-error' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-secondary">{item.label}</span>
                    <span className="text-sm font-medium text-text">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-error" />
              Caracteres problematiques
            </CardTitle>
            <CardDescription>Top 5 des caracteres avec le plus d'erreurs</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.problematicChars.length > 0 ? (
              <div className="space-y-3">
                {profile.problematicChars.slice(0, 5).map((char: CharacterError, index: number) => (
                  <div key={char.char} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-text-muted w-6">#{index + 1}</span>
                    <div className="w-12 h-12 rounded-lg bg-surface-hover flex items-center justify-center font-mono text-2xl font-bold text-text">
                      {char.char}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-text-secondary">{char.count} erreurs</span>
                        <Badge variant="error">{(char.rate * 100).toFixed(1)}%</Badge>
                      </div>
                      <Progress value={char.rate * 100 * 10} variant="error" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-muted py-4">Aucun caractere problematique detecte</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Sequences difficiles
            </CardTitle>
            <CardDescription>Bigrammes et trigrammes lents</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.difficultSequences.length > 0 ? (
              <div className="space-y-3">
                {profile.difficultSequences.slice(0, 4).map((seq: DifficultSequence) => (
                  <div key={seq.sequence} className="flex items-center gap-4 p-3 rounded-lg bg-surface-hover">
                    <div className="font-mono text-xl font-bold text-text px-3 py-1 rounded bg-surface border border-border">
                      {seq.sequence}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge size="sm">{seq.type}</Badge>
                        <span className="text-sm text-text-muted">{Math.round(seq.avgTime)}ms moy.</span>
                      </div>
                    </div>
                    <Badge variant="warning">{(seq.errorRate * 100).toFixed(0)}% erreurs</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-muted py-4">Pas assez de donnees</p>
            )}
          </CardContent>
        </Card>
      </div>

      {wpmPrediction && (
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="py-8">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold text-text mb-2">Prediction de progression</h3>
                <p className="text-text-secondary mb-4">
                  Base sur votre historique et votre rythme d'amelioration
                </p>
                <div className="flex items-baseline gap-4">
                  <div>
                    <p className="text-sm text-text-muted">Actuel</p>
                    <p className="text-3xl font-bold text-text">{Math.round(profile.avgWpm)}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm text-text-muted">Dans 30 jours</p>
                    <p className="text-3xl font-bold text-primary">
                      {Math.round(wpmPrediction.predictedWpm)}
                      <span className="text-lg text-text-muted ml-1">
                        ±{wpmPrediction.confidenceInterval}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <Link to="/training">
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Voir mon plan d'entrainement
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Niveau de competence</CardTitle>
          <CardDescription>Votre score global base sur WPM, precision et consistance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center mb-2">
                <span className="text-4xl font-bold text-text">{Math.round(profile.skillLevel)}</span>
              </div>
              <Badge variant="primary" size="md">{skillBadge.label}</Badge>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-text-secondary">WPM (30%)</span>
                  <span className="text-sm font-medium text-text">{Math.min(100, Math.round(profile.avgWpm))}/100</span>
                </div>
                <Progress value={Math.min(100, profile.avgWpm)} size="sm" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-text-secondary">Precision (30%)</span>
                  <span className="text-sm font-medium text-text">{Math.round(profile.avgAccuracy * 100)}/100</span>
                </div>
                <Progress value={profile.avgAccuracy * 100} variant="success" size="sm" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-text-secondary">Consistance (20%)</span>
                  <span className="text-sm font-medium text-text">{Math.round(profile.consistencyScore)}/100</span>
                </div>
                <Progress value={profile.consistencyScore} variant="warning" size="sm" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-text-secondary">Progression (20%)</span>
                  <span className="text-sm font-medium text-text">
                    {Math.round((profile.skillLevel / 100) * 60 + 20)}/100
                  </span>
                </div>
                <Progress value={(profile.skillLevel / 100) * 60 + 20} variant="info" size="sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function createFallbackProfile(): TypingProfile {
  return {
    userId: 'local',
    skillLevel: 50,
    skillBadge: 'intermediate',
    avgWpm: 60,
    avgAccuracy: 0.92,
    consistencyScore: 70,
    problematicChars: [
      { char: 'e', count: 25, rate: 0.05 },
      { char: 'r', count: 18, rate: 0.04 },
      { char: 't', count: 15, rate: 0.035 },
    ],
    difficultSequences: [
      { sequence: 'qu', avgTime: 180, errorRate: 0.08, type: 'bigram' },
      { sequence: 'er', avgTime: 150, errorRate: 0.06, type: 'bigram' },
    ],
    errorBreakdown: {
      speed: 40,
      cognitive: 30,
      motor: 20,
      fatigue: 10,
    },
    wpmProgression: [],
    fingerStrengthScores: [],
  };
}
