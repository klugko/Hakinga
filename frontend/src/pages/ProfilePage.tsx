import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Award,
  Settings,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

/**
 * User profile page
 */
export function ProfilePage() {
  const { user } = useAuth();

  const stats = {
    avgWpm: 72,
    avgAccuracy: 95.2,
    bestWpm: 89,
    totalSessions: 156,
    totalTime: '24h 35m',
    totalRaces: 89,
    wins: 23,
    rank: 1247,
    skillLevel: 65,
    totalPoints: 2450,
  };

  const recentSessions = [
    { id: '1', type: 'Solo', wpm: 75, accuracy: 96.1, date: '2024-01-15', difficulty: 'Moyen' },
    { id: '2', type: 'Public', wpm: 68, accuracy: 93.8, date: '2024-01-14', rank: 2 },
    { id: '3', type: 'Solo', wpm: 72, accuracy: 95.2, date: '2024-01-14', difficulty: 'Difficile' },
  ];

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar fallback={user.username} size="xl" className="mx-auto mb-4" />
                <h2 className="text-xl font-bold text-text">{user.username}</h2>
                <p className="text-sm text-text-secondary flex items-center justify-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <p className="text-sm text-text-muted flex items-center justify-center gap-2 mt-2">
                  <Calendar className="w-4 h-4" />
                  Membre depuis {formatDate(user.createdAt)}
                </p>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <Badge variant="primary">Intermediaire</Badge>
                  <Badge variant="default">Niveau {stats.skillLevel}</Badge>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Link to="/settings">
                  <Button variant="outline" fullWidth leftIcon={<Settings className="w-4 h-4" />}>
                    Modifier le profil
                  </Button>
                </Link>
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
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-text">#{stats.rank}</p>
                  <p className="text-sm text-text-secondary">Position globale</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{stats.totalPoints}</p>
                    <p className="text-xs text-text-muted">Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">{stats.wins}</p>
                    <p className="text-xs text-text-muted">Victoires</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-text">{stats.avgWpm}</p>
                  <p className="text-xs text-text-muted">WPM Moyen</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-2">
                    <Target className="w-6 h-6 text-success" />
                  </div>
                  <p className="text-2xl font-bold text-text">{stats.avgAccuracy}%</p>
                  <p className="text-xs text-text-muted">Precision</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-2xl font-bold text-text">{stats.bestWpm}</p>
                  <p className="text-xs text-text-muted">Meilleur WPM</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-warning/20 flex items-center justify-center mb-2">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <p className="text-2xl font-bold text-text">{stats.totalTime}</p>
                  <p className="text-xs text-text-muted">Temps total</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Niveau de competence</span>
                  <span className="text-sm font-medium text-text">{stats.skillLevel}/100</span>
                </div>
                <Progress value={stats.skillLevel} variant="gradient" size="lg" />
                <p className="text-xs text-text-muted mt-2">
                  Encore {100 - stats.skillLevel} points pour atteindre le niveau Avance
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Sessions Recentes
              </CardTitle>
              <Link
                to="/history"
                className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" />
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
                          <User className="w-5 h-5 text-primary" />
                        ) : (
                          <Trophy className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text">{session.type}</span>
                          {session.difficulty && (
                            <Badge size="sm">{session.difficulty}</Badge>
                          )}
                          {session.rank && (
                            <Badge variant="success" size="sm">#{session.rank}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-muted">{formatDate(session.date)}</p>
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
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Speed Demon', icon: '⚡', unlocked: true },
                  { name: 'Perfectionniste', icon: '🎯', unlocked: true },
                  { name: 'Marathon', icon: '🏃', unlocked: false, progress: 70 },
                  { name: 'Champion', icon: '🏆', unlocked: false, progress: 30 },
                ].map((achievement) => (
                  <div
                    key={achievement.name}
                    className={`p-4 rounded-lg border text-center ${
                      achievement.unlocked
                        ? 'bg-gold/10 border-gold/30'
                        : 'bg-surface-hover border-border opacity-60'
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <p className="text-sm font-medium text-text">{achievement.name}</p>
                    {!achievement.unlocked && achievement.progress && (
                      <Progress value={achievement.progress} size="sm" className="mt-2" />
                    )}
                  </div>
                ))}
              </div>
              <Link to="/achievements" className="block mt-4">
                <Button variant="ghost" fullWidth size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Tous les achievements
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
