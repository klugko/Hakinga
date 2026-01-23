import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import {
  Keyboard,
  Zap,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Play,
  Users,
  BarChart3,
} from 'lucide-react';

const quickActions = [
  {
    href: '/solo',
    icon: Keyboard,
    label: 'Pratique Solo',
    description: 'Entrainement personnalise',
    color: 'bg-primary/10 text-primary',
  },
  {
    href: '/competition',
    icon: Zap,
    label: 'Competition',
    description: 'Affronter d\'autres joueurs',
    color: 'bg-accent/10 text-accent',
  },
  {
    href: '/session/private/create',
    icon: Users,
    label: 'Session Privee',
    description: 'Jouer avec des amis',
    color: 'bg-success/10 text-success',
  },
  {
    href: '/training',
    icon: Target,
    label: 'Entrainement',
    description: 'Exercices cibles',
    color: 'bg-warning/10 text-warning',
  },
];

const recentSessions = [
  { id: '1', type: 'Solo', wpm: 72, accuracy: 95.2, date: 'Il y a 2h', difficulty: 'Moyen' },
  { id: '2', type: 'Public', wpm: 68, accuracy: 93.8, date: 'Hier', difficulty: 'Moyen', rank: 2 },
  { id: '3', type: 'Solo', wpm: 75, accuracy: 96.1, date: 'Hier', difficulty: 'Difficile' },
];

/**
 * Dashboard page for authenticated users
 */
export function DashboardPage() {
  const { user } = useAuth();

  const stats = {
    avgWpm: 72,
    avgAccuracy: 95.2,
    totalSessions: 156,
    totalTime: '24h 35m',
    bestWpm: 89,
    skillLevel: 65,
    weeklyProgress: 8,
    rank: 1247,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Bonjour, {user?.username}</h1>
        <p className="text-text-secondary mt-1">
          Pret pour une nouvelle session de dactylographie ?
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} to={action.href}>
              <Card variant="interactive" className="h-full">
                <CardContent className="flex flex-col items-center text-center py-6">
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-text">{action.label}</h3>
                  <p className="text-sm text-text-muted mt-1">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-text-muted mb-1">WPM Moyen</p>
                <p className="text-3xl font-bold text-text">{stats.avgWpm}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +{stats.weeklyProgress}% cette semaine
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Precision</p>
                <p className="text-3xl font-bold text-text">{stats.avgAccuracy}%</p>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Meilleur WPM</p>
                <p className="text-3xl font-bold text-accent">{stats.bestWpm}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Sessions</p>
                <p className="text-3xl font-bold text-text">{stats.totalSessions}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Niveau de competence</span>
                <Badge variant="primary">Intermediaire</Badge>
              </div>
              <Progress value={stats.skillLevel} variant="gradient" size="lg" />
              <p className="text-xs text-text-muted mt-2">
                {stats.skillLevel}/100 - Encore {100 - stats.skillLevel} points pour le niveau Avance
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              Classement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-sm text-text-muted mb-2">Votre position</p>
              <p className="text-4xl font-bold text-text">#{stats.rank}</p>
              <p className="text-sm text-text-secondary mt-2">sur 10,000+ joueurs</p>
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Points totaux</span>
                <span className="font-semibold text-text">2,450</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Victoires</span>
                <span className="font-semibold text-text">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Courses</span>
                <span className="font-semibold text-text">89</span>
              </div>
            </div>

            <Link to="/leaderboard" className="block mt-4">
              <Button variant="outline" fullWidth size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Voir le classement
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Sessions Recentes
            </CardTitle>
            <Link to="/history" className="text-sm text-primary hover:text-primary-hover">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/session/${session.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-hover hover:bg-surface-active transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      session.type === 'Solo' ? 'bg-primary/10' : 'bg-accent/10'
                    }`}>
                      {session.type === 'Solo' ? (
                        <Keyboard className="w-5 h-5 text-primary" />
                      ) : (
                        <Zap className="w-5 h-5 text-accent" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">{session.type}</span>
                        <Badge size="sm">{session.difficulty}</Badge>
                        {session.rank && (
                          <Badge variant="success" size="sm">
                            #{session.rank}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">{session.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text">{session.wpm} WPM</p>
                    <p className="text-xs text-text-muted">{session.accuracy}%</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gold" />
              Achievements Recents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-gold/10 border border-gold/20">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-text">Speed Demon</h4>
                  <p className="text-sm text-text-secondary">Atteindre 80 WPM</p>
                </div>
                <Badge variant="warning">Nouveau</Badge>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-surface-hover">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-text">Perfectionniste</h4>
                  <p className="text-sm text-text-secondary">99%+ de precision</p>
                  <Progress value={70} size="sm" className="mt-2" />
                </div>
                <span className="text-sm text-text-muted">7/10</span>
              </div>

              <Link to="/achievements" className="block">
                <Button variant="ghost" fullWidth size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Tous les achievements
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text">Pret pour une course ?</h3>
              <p className="text-sm text-text-secondary">
                Rejoignez une competition publique maintenant
              </p>
            </div>
          </div>
          <Link to="/competition">
            <Button rightIcon={<Zap className="w-4 h-4" />}>Trouver une course</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
