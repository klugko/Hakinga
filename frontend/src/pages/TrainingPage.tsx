import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { LoadingOverlay } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import { mlApi } from '@/lib/api';
import {
  Brain,
  Target,
  Zap,
  Trophy,
  Play,
  CheckCircle,
  Lock,
  TrendingUp,
  Keyboard,
  RefreshCw,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrainingPlan, TrainingDay, DailyInsight, DrillType } from '@/types';

interface TrainingModule {
  id: string;
  name: string;
  description: string;
  type: DrillType;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  completed: boolean;
  locked: boolean;
  progress?: number;
}

interface WeaknessArea {
  key: string;
  label: string;
  accuracy: number;
  frequency: number;
}

const DEFAULT_MODULES: TrainingModule[] = [
  {
    id: '1',
    name: 'Echauffement',
    description: 'Sequences courtes pour preparer vos doigts',
    type: 'speed',
    difficulty: 'easy',
    duration: '3 min',
    completed: false,
    locked: false,
  },
  {
    id: '2',
    name: 'Touches problematiques',
    description: 'Exercices cibles sur vos faiblesses detectees',
    type: 'character',
    difficulty: 'medium',
    duration: '5 min',
    completed: false,
    locked: false,
  },
  {
    id: '3',
    name: 'Vitesse progressive',
    description: 'Augmentez graduellement votre vitesse',
    type: 'speed',
    difficulty: 'medium',
    duration: '8 min',
    completed: false,
    locked: false,
  },
  {
    id: '4',
    name: 'Precision extreme',
    description: 'Focus sur 99%+ de precision',
    type: 'accuracy',
    difficulty: 'hard',
    duration: '10 min',
    completed: false,
    locked: false,
  },
  {
    id: '5',
    name: 'Marathon',
    description: 'Session longue pour l\'endurance',
    type: 'speed',
    difficulty: 'hard',
    duration: '15 min',
    completed: false,
    locked: true,
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'speed':
      return <Zap className="w-5 h-5" />;
    case 'accuracy':
      return <Target className="w-5 h-5" />;
    case 'character':
    case 'weakness':
      return <Brain className="w-5 h-5" />;
    case 'bigram':
      return <Keyboard className="w-5 h-5" />;
    default:
      return <Keyboard className="w-5 h-5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'speed':
      return 'text-primary';
    case 'accuracy':
      return 'text-success';
    case 'character':
    case 'weakness':
      return 'text-accent';
    case 'bigram':
      return 'text-warning';
    default:
      return 'text-text-muted';
  }
};

const getDifficultyColor = (difficulty: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (difficulty) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * AI-powered training page with personalized exercises
 */
export function TrainingPage() {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();

  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [weaknessAreas, setWeaknessAreas] = useState<WeaknessArea[]>([]);
  const [modules, setModules] = useState<TrainingModule[]>(DEFAULT_MODULES);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadTrainingData = async () => {
    try {
      const [planData, insightData, errorProfile] = await Promise.all([
        mlApi.getTrainingPlan().catch(() => null),
        mlApi.getDailyInsight().catch(() => null),
        mlApi.getErrorProfile().catch(() => ({ chars: [] })),
      ]);

      setTrainingPlan(planData);
      setDailyInsight(insightData);

      if (errorProfile.chars.length > 0) {
        setWeaknessAreas(
          errorProfile.chars.slice(0, 4).map((c) => ({
            key: c.char,
            label: `Touche ${c.char.toUpperCase()}`,
            accuracy: Math.round((1 - c.errorRate) * 100),
            frequency: c.frequency,
          }))
        );
      }

      if (planData && planData.days.length > 0) {
        const todayIndex = new Date().getDay();
        const todayPlan = planData.days.find((d) => d.dayNumber === todayIndex) || planData.days[0];
        updateModulesFromPlan(todayPlan, planData.completedDays);
      }
    } catch {
      showError('Erreur lors du chargement du plan d\'entrainement');
    } finally {
      setIsLoading(false);
    }
  };

  const updateModulesFromPlan = (_day: TrainingDay, completedDays: number) => {
    const updatedModules = DEFAULT_MODULES.map((module, index) => ({
      ...module,
      completed: index < completedDays,
      locked: index > completedDays + 1,
      progress: index === completedDays ? 40 : undefined,
    }));
    setModules(updatedModules);
  };

  useEffect(() => {
    loadTrainingData();
  }, []);

  const completedModules = modules.filter((m) => m.completed).length;
  const totalModules = modules.filter((m) => !m.locked).length;

  const handleStartModule = (moduleId: string) => {
    navigate(`/training/${moduleId}`);
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const newPlan = await mlApi.getTrainingPlan();
      setTrainingPlan(newPlan);
      if (newPlan && newPlan.days.length > 0) {
        const todayIndex = new Date().getDay();
        const todayPlan = newPlan.days.find((d) => d.dayNumber === todayIndex) || newPlan.days[0];
        updateModulesFromPlan(todayPlan, newPlan.completedDays);
      }
      showSuccess('Plan d\'entrainement regenere !');
    } catch {
      showError('Erreur lors de la generation du plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTrainWeaknesses = () => {
    navigate('/training/2');
  };

  const handleDismissInsight = async () => {
    if (dailyInsight) {
      try {
        await mlApi.dismissInsight(dailyInsight.id);
        setDailyInsight(null);
      } catch {
        setDailyInsight(null);
      }
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Chargement du plan d'entrainement..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
          <Brain className="w-5 h-5 text-accent" />
          <span className="text-accent font-medium">Entrainement IA</span>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">Plan d'entrainement personnalise</h1>
        <p className="text-text-secondary">
          Exercices adaptes a votre profil par notre IA
        </p>
      </div>

      {dailyInsight && (
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">Conseil du jour</h3>
                <p className="text-text-secondary">{dailyInsight.text}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismissInsight}>
                Compris
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="py-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-text">
              {trainingPlan ? `+${Math.round((trainingPlan.completedDays / 7) * 15)}%` : '+0%'}
            </p>
            <p className="text-sm text-text-muted">Progression cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-success" />
            </div>
            <p className="text-2xl font-bold text-text">85 WPM</p>
            <p className="text-sm text-text-muted">Objectif actuel</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-gold" />
            </div>
            <p className="text-2xl font-bold text-text">{completedModules}/{totalModules}</p>
            <p className="text-sm text-text-muted">Modules completes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Modules du jour</CardTitle>
                  <CardDescription>Completez ces exercices pour atteindre votre objectif</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw className={cn('w-4 h-4', isGenerating && 'animate-spin')} />}
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generation...' : 'Regenerer'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-muted">Progression du jour</span>
                  <span className="font-medium text-text">
                    {totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={totalModules > 0 ? (completedModules / totalModules) * 100 : 0}
                  variant="gradient"
                />
              </div>

              <div className="space-y-3">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all',
                      module.locked
                        ? 'bg-surface-hover border-border opacity-60'
                        : module.completed
                        ? 'bg-success/5 border-success/20'
                        : 'bg-surface-hover border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          module.locked
                            ? 'bg-surface-active'
                            : module.completed
                            ? 'bg-success/20'
                            : 'bg-primary/10'
                        )}
                      >
                        {module.locked ? (
                          <Lock className="w-5 h-5 text-text-muted" />
                        ) : module.completed ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <span className={getTypeColor(module.type)}>{getTypeIcon(module.type)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-text">{module.name}</h4>
                          <Badge variant={getDifficultyColor(module.difficulty)} size="sm">
                            {module.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary">{module.description}</p>

                        {module.progress !== undefined && !module.completed && (
                          <div className="mt-2">
                            <Progress value={module.progress} size="sm" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-text-muted">{module.duration}</span>
                        {!module.locked && !module.completed && (
                          <Button
                            size="sm"
                            leftIcon={<Play className="w-4 h-4" />}
                            onClick={() => handleStartModule(module.id)}
                          >
                            Commencer
                          </Button>
                        )}
                        {module.completed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartModule(module.id)}
                          >
                            Refaire
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent" />
                Faiblesses detectees
              </CardTitle>
              <CardDescription>Points a ameliorer identifies par l'IA</CardDescription>
            </CardHeader>
            <CardContent>
              {weaknessAreas.length > 0 ? (
                <div className="space-y-4">
                  {weaknessAreas.map((area) => (
                    <div key={area.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-error/20 flex items-center justify-center text-sm font-mono font-bold text-error">
                            {area.key.toUpperCase()}
                          </span>
                          <span className="text-sm text-text">{area.label}</span>
                        </div>
                        <span className="text-sm font-medium text-error">{area.accuracy}%</span>
                      </div>
                      <Progress
                        value={area.accuracy}
                        size="sm"
                        className="[&>div]:bg-error"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    Completez plus de sessions pour detecter vos faiblesses
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                fullWidth
                className="mt-4"
                onClick={handleTrainWeaknesses}
                disabled={weaknessAreas.length === 0}
              >
                Entrainer ces touches
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conseils IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-text">
                    <span className="font-medium text-primary">Vitesse : </span>
                    Concentrez-vous sur la fluidite plutot que la vitesse brute.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-text">
                    <span className="font-medium text-success">Precision : </span>
                    Votre precision sur les majuscules s'ameliore !
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-text">
                    <span className="font-medium text-accent">Posture : </span>
                    Pensez a faire des pauses regulieres.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="py-6 text-center">
              <h3 className="font-semibold text-text mb-2">Analyse complete</h3>
              <p className="text-sm text-text-secondary mb-4">
                Consultez votre profil de frappe detaille
              </p>
              <Link to="/typing-profile">
                <Button variant="outline" fullWidth>
                  Voir mon profil ML
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
