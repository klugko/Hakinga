import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import {
  Trophy,
  Target,
  Clock,
  AlertCircle,
  RotateCcw,
  Home,
  Share2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { formatDuration, formatAccuracy, getRankColor } from '@/lib/utils';
import type { SessionResult, CharacterError } from '@/types';

interface SessionResultsProps {
  result: SessionResult;
  onRestart?: () => void;
  showRank?: boolean;
  rank?: number;
  showShare?: boolean;
}

/**
 * Session results display component
 */
export function SessionResults({
  result,
  onRestart,
  showRank = false,
  rank,
  showShare = true,
}: SessionResultsProps) {
  const { wpm, accuracy, duration, errorsCount, correctChars, totalChars, errorsByChar } = result;

  const getPerformanceLevel = () => {
    if (wpm >= 80 && accuracy >= 0.95) return { label: 'Excellent', color: 'text-gold' };
    if (wpm >= 60 && accuracy >= 0.9) return { label: 'Tres bien', color: 'text-success' };
    if (wpm >= 40 && accuracy >= 0.85) return { label: 'Bien', color: 'text-accent' };
    return { label: 'A ameliorer', color: 'text-warning' };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="text-center mb-8">
        {showRank && rank && (
          <div className="mb-4">
            <span className={`text-6xl font-bold ${getRankColor(rank)}`}>#{rank}</span>
            <p className="text-text-secondary mt-2">Position finale</p>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <span className={`font-semibold ${performance.color}`}>{performance.label}</span>
        </div>

        <h2 className="text-3xl font-bold text-text mb-2">Session terminee !</h2>
        <p className="text-text-secondary">Voici vos resultats detailles</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{Math.round(wpm)}</p>
            <p className="text-sm text-text-muted">WPM</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-success" />
            </div>
            <p className="text-3xl font-bold text-success">{formatAccuracy(accuracy)}</p>
            <p className="text-sm text-text-muted">Precision</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <p className="text-3xl font-bold text-accent">{formatDuration(duration)}</p>
            <p className="text-sm text-text-muted">Duree</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-error/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            <p className="text-3xl font-bold text-error">{errorsCount}</p>
            <p className="text-sm text-text-muted">Erreurs</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="py-6">
          <h3 className="font-semibold text-text mb-4">Resume</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Caracteres corrects</span>
              <span className="font-medium text-text">
                {correctChars} / {totalChars}
              </span>
            </div>
            <Progress
              value={(correctChars / totalChars) * 100}
              variant="success"
              size="md"
            />

            {errorsByChar && errorsByChar.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium text-text mb-3">
                  Caracteres problematiques
                </h4>
                <div className="flex flex-wrap gap-2">
                  {errorsByChar.slice(0, 5).map((error: CharacterError) => (
                    <Badge key={error.char} variant="error">
                      "{error.char === ' ' ? 'espace' : error.char}" - {error.count} erreurs
                    </Badge>
                  ))}
                </div>
                {errorsByChar.length > 0 && (
                  <p className="text-sm text-text-muted mt-3">
                    Conseil : Pratiquez ces caracteres avec des exercices cibles
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        {onRestart && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<RotateCcw className="w-5 h-5" />}
            onClick={onRestart}
          >
            Refaire une session
          </Button>
        )}
        <Link to="/solo" className="flex-1">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            leftIcon={<ArrowRight className="w-5 h-5" />}
          >
            Nouveau texte
          </Button>
        </Link>
        <Link to="/dashboard" className="flex-1">
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            leftIcon={<Home className="w-5 h-5" />}
          >
            Accueil
          </Button>
        </Link>
      </div>

      {showShare && (
        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
            Partager mes resultats
          </Button>
        </div>
      )}
    </div>
  );
}
