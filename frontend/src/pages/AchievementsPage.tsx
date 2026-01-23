import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Award, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

const achievements: Achievement[] = [
  { id: '1', name: 'Premiere Course', description: 'Terminer votre premiere session', icon: '🎯', category: 'Debut', unlocked: true, unlockedAt: '2024-01-01' },
  { id: '2', name: 'Speed Demon', description: 'Atteindre 80 WPM', icon: '⚡', category: 'Vitesse', unlocked: true, unlockedAt: '2024-01-10' },
  { id: '3', name: 'Perfectionniste', description: '99%+ de precision sur 10 sessions', icon: '🎯', category: 'Precision', unlocked: false, progress: 7, maxProgress: 10 },
  { id: '4', name: 'Marathon', description: 'Completer 100 sessions', icon: '🏃', category: 'Endurance', unlocked: false, progress: 56, maxProgress: 100 },
  { id: '5', name: 'Vainqueur', description: 'Gagner 10 courses publiques', icon: '🏆', category: 'Competition', unlocked: false, progress: 3, maxProgress: 10 },
  { id: '6', name: 'Social', description: 'Ajouter 5 amis', icon: '👥', category: 'Social', unlocked: true, unlockedAt: '2024-01-08' },
  { id: '7', name: 'Apprenti', description: 'Completer 5 drills personnalises', icon: '📚', category: 'Entrainement', unlocked: false, progress: 2, maxProgress: 5 },
  { id: '8', name: 'Centurion', description: 'Atteindre 100 WPM', icon: '💯', category: 'Vitesse', unlocked: false, progress: 78, maxProgress: 100 },
  { id: '9', name: 'Consistant', description: 'Jouer 7 jours consecutifs', icon: '📅', category: 'Engagement', unlocked: true, unlockedAt: '2024-01-14' },
  { id: '10', name: 'Maitre du Code', description: 'Terminer 20 sessions en mode code', icon: '💻', category: 'Specialisation', unlocked: false, progress: 8, maxProgress: 20 },
  { id: '11', name: 'Top 100', description: 'Entrer dans le top 100 global', icon: '🌟', category: 'Competition', unlocked: false },
  { id: '12', name: 'Elite', description: 'Atteindre le niveau Expert', icon: '👑', category: 'Progression', unlocked: false, progress: 65, maxProgress: 100 },
];

const categories = [...new Set(achievements.map((a) => a.category))];

/**
 * Achievements page showing all badges and progress
 */
export function AchievementsPage() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-4">
          <Award className="w-5 h-5 text-gold" />
          <span className="text-gold font-medium">Achievements</span>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">Vos recompenses</h1>
        <p className="text-text-secondary">
          {unlockedCount} sur {totalCount} achievements debloques
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-text">Progression globale</span>
            <span className="text-lg font-bold text-primary">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
          <Progress value={(unlockedCount / totalCount) * 100} variant="gradient" size="lg" />
        </CardContent>
      </Card>

      <div className="space-y-8">
        {categories.map((category) => {
          const categoryAchievements = achievements.filter((a) => a.category === category);
          const categoryUnlocked = categoryAchievements.filter((a) => a.unlocked).length;

          return (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{category}</CardTitle>
                  <Badge variant={categoryUnlocked === categoryAchievements.length ? 'success' : 'default'}>
                    {categoryUnlocked}/{categoryAchievements.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {categoryAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={cn(
                        'relative p-4 rounded-lg border transition-all',
                        achievement.unlocked
                          ? 'bg-gold/5 border-gold/20'
                          : 'bg-surface-hover border-border opacity-70'
                      )}
                    >
                      {achievement.unlocked && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'w-14 h-14 rounded-xl flex items-center justify-center text-3xl',
                            achievement.unlocked ? 'bg-gold/20' : 'bg-surface-active'
                          )}
                        >
                          {achievement.unlocked ? (
                            achievement.icon
                          ) : (
                            <Lock className="w-6 h-6 text-text-muted" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-text">{achievement.name}</h4>
                          <p className="text-sm text-text-secondary mt-1">
                            {achievement.description}
                          </p>

                          {!achievement.unlocked && achievement.progress !== undefined && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                                <span>Progression</span>
                                <span>
                                  {achievement.progress}/{achievement.maxProgress}
                                </span>
                              </div>
                              <Progress
                                value={(achievement.progress / (achievement.maxProgress || 1)) * 100}
                                size="sm"
                              />
                            </div>
                          )}

                          {achievement.unlocked && achievement.unlockedAt && (
                            <p className="text-xs text-text-muted mt-2">
                              Debloque le {achievement.unlockedAt}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
