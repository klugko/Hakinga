import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTypingSession } from '@/hooks/useTypingSession';
import { TypingArea, TypingStatsBar } from '@/components/typing/TypingArea';
import { SessionResults } from '@/components/typing/SessionResults';
import { Button } from '@/components/ui/Button';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { LoadingCard } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useToast } from '@/contexts/ToastContext';
import { mlApi } from '@/lib/api';
import {
  ArrowLeft,
  X,
  RotateCcw,
  Target,
  Zap,
  Brain,
  Trophy,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import type { SessionResult, Drill, DrillType } from '@/types';

interface ModuleConfig {
  id: string;
  name: string;
  type: DrillType;
  description: string;
  targetAccuracy: number;
  targetWpm: number;
  icon: typeof Target;
  color: string;
}

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  '1': {
    id: '1',
    name: 'Echauffement',
    type: 'speed',
    description: 'Sequences courtes pour preparer vos doigts',
    targetAccuracy: 0.9,
    targetWpm: 50,
    icon: Zap,
    color: 'text-primary',
  },
  '2': {
    id: '2',
    name: 'Touches problematiques',
    type: 'character',
    description: 'Exercices cibles sur vos faiblesses detectees',
    targetAccuracy: 0.95,
    targetWpm: 40,
    icon: Brain,
    color: 'text-accent',
  },
  '3': {
    id: '3',
    name: 'Vitesse progressive',
    type: 'speed',
    description: 'Augmentez graduellement votre vitesse',
    targetAccuracy: 0.92,
    targetWpm: 60,
    icon: Zap,
    color: 'text-primary',
  },
  '4': {
    id: '4',
    name: 'Precision extreme',
    type: 'accuracy',
    description: 'Focus sur 99%+ de precision',
    targetAccuracy: 0.99,
    targetWpm: 35,
    icon: Target,
    color: 'text-success',
  },
  '5': {
    id: '5',
    name: 'Marathon',
    type: 'speed',
    description: 'Session longue pour l\'endurance',
    targetAccuracy: 0.93,
    targetWpm: 55,
    icon: Trophy,
    color: 'text-gold',
  },
};

const SAMPLE_DRILLS: Record<DrillType, string[]> = {
  character: [
    'qwertyuiop asdfghjkl zxcvbnm qwerty asdfg zxcvb qwer asdf zxcv',
    'queue quitter question equivalent eloquent sequence frequence quelle quelque quest',
    'zephyr zenith zigzag zone zero bizarre pizzazz puzzle fizzle drizzle',
  ],
  bigram: [
    'the and for are but not you all can had her was one our out day has his how its may new now old see two way who boy did get has let put say she too use',
    'er th in on an re es ed it te at en ar nt st de er an to is',
  ],
  speed: [
    'Les touches de base sont la fondation d\'une frappe rapide et precise. Gardez vos doigts sur ASDF et JKL; pour une position optimale.',
    'La pratique reguliere est la cle du progres en dactylographie. Quelques minutes par jour valent mieux qu\'une longue session occasionnelle.',
    'Concentrez-vous sur la fluidite de vos mouvements plutot que sur la vitesse brute. La precision amene naturellement la rapidite.',
  ],
  accuracy: [
    'Chaque caractere compte. Prenez le temps de taper correctement chaque lettre, chaque mot, chaque phrase. La precision est primordiale.',
    'Respirez calmement et gardez un rythme constant. Ne vous precipitez pas. Visualisez les mots avant de les taper.',
    'Concentrez votre attention sur le texte. Eliminez les distractions. Chaque frappe doit etre intentionnelle et precise.',
  ],
};

/**
 * Training session page for personalized drills
 */
export function TrainingSessionPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();

  const [drill, setDrill] = useState<Drill | null>(null);
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [moduleConfig, setModuleConfig] = useState<ModuleConfig | null>(null);
  const [objectivesMet, setObjectivesMet] = useState<{
    accuracy: boolean;
    wpm: boolean;
  } | null>(null);

  useEffect(() => {
    const loadDrill = async () => {
      if (!moduleId) {
        navigate('/training');
        return;
      }

      setIsLoading(true);
      const config = MODULE_CONFIGS[moduleId];

      if (!config) {
        showError('Module de formation introuvable');
        navigate('/training');
        return;
      }

      setModuleConfig(config);

      try {
        const fetchedDrill = await mlApi.generateDrill();
        setDrill(fetchedDrill);
        setText(fetchedDrill.content);
      } catch {
        const drillTexts = SAMPLE_DRILLS[config.type];
        const randomText = drillTexts[Math.floor(Math.random() * drillTexts.length)];
        setText(randomText);

        setDrill({
          id: `local-${Date.now()}`,
          userId: 'local',
          drillType: config.type,
          content: randomText,
          objective: `Atteignez ${config.targetAccuracy * 100}% de precision et ${config.targetWpm} WPM`,
          createdAt: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDrill();
  }, [moduleId, navigate, showError]);

  const handleComplete = useCallback(
    (result: {
      wpm: number;
      accuracy: number;
      duration: number;
      errorsCount: number;
      correctChars: number;
      totalChars: number;
    }) => {
      const sessionResult: SessionResult = {
        wpm: result.wpm,
        accuracy: result.accuracy,
        duration: result.duration,
        errorsCount: result.errorsCount,
        correctChars: result.correctChars,
        totalChars: result.totalChars,
        wpmOverTime: [],
        errorsByChar: [],
      };
      setSessionResult(sessionResult);

      if (moduleConfig) {
        const accuracyMet = result.accuracy >= moduleConfig.targetAccuracy;
        const wpmMet = result.wpm >= moduleConfig.targetWpm;
        setObjectivesMet({ accuracy: accuracyMet, wpm: wpmMet });

        if (accuracyMet && wpmMet) {
          showSuccess('Objectifs atteints ! Excellent travail !');
        }
      }
    },
    [moduleConfig, showSuccess]
  );

  const {
    charStates,
    currentIndex,
    isStarted,
    isFinished,
    currentWpm,
    currentAccuracy,
    progress,
    duration,
    errorsCount,
    handleKeyDown,
    reset,
  } = useTypingSession({
    text,
    onComplete: handleComplete,
  });

  const handleRestart = () => {
    setSessionResult(null);
    setObjectivesMet(null);
    reset();
  };

  const handleNewDrill = async () => {
    setSessionResult(null);
    setObjectivesMet(null);
    setIsLoading(true);

    try {
      const fetchedDrill = await mlApi.generateDrill();
      setDrill(fetchedDrill);
      setText(fetchedDrill.content);
    } catch {
      if (moduleConfig) {
        const drillTexts = SAMPLE_DRILLS[moduleConfig.type];
        const randomText = drillTexts[Math.floor(Math.random() * drillTexts.length)];
        setText(randomText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbandon = () => {
    setShowAbandonModal(false);
    navigate('/training');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingCard message="Generation de l'exercice..." />
      </div>
    );
  }

  if (sessionResult && moduleConfig) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <moduleConfig.icon className={`w-5 h-5 ${moduleConfig.color}`} />
              <span className="text-text font-medium">{moduleConfig.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Exercice termine !</h1>
          </div>

          <Card className="mb-6">
            <CardContent className="py-6">
              <h3 className="font-semibold text-text mb-4 text-center">Objectifs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border ${
                    objectivesMet?.accuracy
                      ? 'bg-success/10 border-success/30'
                      : 'bg-error/10 border-error/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {objectivesMet?.accuracy ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-error" />
                    )}
                    <span className="font-medium text-text">Precision</span>
                  </div>
                  <p className="text-2xl font-bold text-text">
                    {(sessionResult.accuracy * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-text-muted">
                    Objectif : {(moduleConfig.targetAccuracy * 100).toFixed(0)}%
                  </p>
                  <Progress
                    value={(sessionResult.accuracy / moduleConfig.targetAccuracy) * 100}
                    variant={objectivesMet?.accuracy ? 'success' : 'error'}
                    size="sm"
                    className="mt-2"
                  />
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    objectivesMet?.wpm
                      ? 'bg-success/10 border-success/30'
                      : 'bg-error/10 border-error/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {objectivesMet?.wpm ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-error" />
                    )}
                    <span className="font-medium text-text">Vitesse</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{Math.round(sessionResult.wpm)} WPM</p>
                  <p className="text-sm text-text-muted">Objectif : {moduleConfig.targetWpm} WPM</p>
                  <Progress
                    value={(sessionResult.wpm / moduleConfig.targetWpm) * 100}
                    variant={objectivesMet?.wpm ? 'success' : 'error'}
                    size="sm"
                    className="mt-2"
                  />
                </div>
              </div>

              {objectivesMet?.accuracy && objectivesMet?.wpm && (
                <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/30 text-center">
                  <Badge variant="success" size="md">
                    <Trophy className="w-4 h-4 mr-1" />
                    Module reussi !
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <SessionResults
            result={sessionResult}
            onRestart={handleRestart}
            showShare={false}
          />

          <div className="flex gap-4 mt-6">
            <Button variant="outline" fullWidth onClick={handleNewDrill}>
              Nouvel exercice
            </Button>
            <Link to="/training" className="flex-1">
              <Button variant="primary" fullWidth>
                Retour au plan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              to="/training"
              className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Retour</span>
            </Link>

            {moduleConfig && (
              <div className="flex items-center gap-2">
                <Badge>
                  <moduleConfig.icon className={`w-4 h-4 mr-1 ${moduleConfig.color}`} />
                  {moduleConfig.name}
                </Badge>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                onClick={handleRestart}
                disabled={!isStarted}
              >
                <span className="hidden sm:inline">Recommencer</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X className="w-4 h-4" />}
                onClick={() => setShowAbandonModal(true)}
              >
                <span className="hidden sm:inline">Abandonner</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {!isStarted && moduleConfig && (
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <moduleConfig.icon className={`w-5 h-5 ${moduleConfig.color}`} />
                <span className="text-text font-medium">{moduleConfig.name}</span>
              </div>
              <h2 className="text-xl font-semibold text-text mb-2">{moduleConfig.description}</h2>
              <p className="text-text-secondary">
                Objectif : {(moduleConfig.targetAccuracy * 100).toFixed(0)}% de precision /{' '}
                {moduleConfig.targetWpm} WPM
              </p>
              <p className="text-sm text-text-muted mt-2">
                Commencez a taper pour demarrer le chronometre
              </p>
            </div>
          )}

          {drill?.objective && !isStarted && (
            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-text">{drill.objective}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-6">
            <TypingStatsBar
              wpm={currentWpm}
              accuracy={currentAccuracy}
              progress={progress}
              duration={duration}
              errorsCount={errorsCount}
            />
          </div>

          <TypingArea
            charStates={charStates}
            currentIndex={currentIndex}
            onKeyDown={handleKeyDown}
            disabled={isFinished}
          />

          {!isStarted && (
            <p className="text-center text-sm text-text-muted mt-4">
              Astuce : Concentrez-vous sur la precision, la vitesse viendra naturellement.
            </p>
          )}
        </div>
      </main>

      <Modal
        isOpen={showAbandonModal}
        onClose={() => setShowAbandonModal(false)}
        title="Abandonner l'exercice ?"
        description="Votre progression ne sera pas sauvegardee."
      >
        <ModalActions>
          <Button variant="ghost" onClick={() => setShowAbandonModal(false)}>
            Continuer
          </Button>
          <Button variant="danger" onClick={handleAbandon}>
            Abandonner
          </Button>
        </ModalActions>
      </Modal>
    </div>
  );
}
