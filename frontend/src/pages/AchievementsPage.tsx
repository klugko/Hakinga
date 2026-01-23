import { useState, useEffect } from 'react';
import { Trophy, Lock, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, Badge, Progress } from '@/components/ui';
import { achievementService } from '@/services';
import { formatDate, cn } from '@/lib/utils';
import type { Achievement } from '@/types';

function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const data = await achievementService.getAchievements();
        setAchievements(data);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f59e0b]/20 rounded-2xl mb-4">
            <Trophy className="w-8 h-8 text-[#f59e0b]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Achievements</h1>
          <p className="text-[#a1a1aa] mt-1">
            You've unlocked {unlockedCount} of {totalCount} achievements
          </p>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <Card variant="bordered" padding="md" className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#a1a1aa]">Overall Progress</span>
              <span className="text-sm font-medium text-white">
                {Math.round((unlockedCount / totalCount) * 100)}%
              </span>
            </div>
            <Progress value={unlockedCount} max={totalCount} size="md" />
          </Card>
        )}

        {/* Achievements Grid */}
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = !!achievement.unlockedAt;
              const hasProgress = achievement.progress !== undefined && achievement.maxProgress !== undefined;

              return (
                <Card
                  key={achievement.id}
                  variant="bordered"
                  padding="lg"
                  className={cn(
                    'relative overflow-hidden transition-all duration-200',
                    isUnlocked
                      ? 'border-[#22c55e]/30 bg-[#22c55e]/5'
                      : 'opacity-70 hover:opacity-100'
                  )}
                >
                  {/* Unlocked indicator */}
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                      <div className="absolute top-2 right-[-35px] w-[100px] text-center text-xs font-medium bg-[#22c55e] text-white py-1 rotate-45">
                        Unlocked
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center text-3xl',
                        isUnlocked ? 'bg-[#22c55e]/20' : 'bg-[#2a2a2a]'
                      )}
                    >
                      {isUnlocked ? (
                        achievement.icon
                      ) : (
                        <Lock className="w-6 h-6 text-[#71717a]" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{achievement.name}</h3>
                      <p className="text-sm text-[#a1a1aa] mb-2">{achievement.description}</p>

                      {/* Progress or unlock date */}
                      {isUnlocked ? (
                        <p className="text-xs text-[#22c55e]">
                          Unlocked on {formatDate(achievement.unlockedAt!)}
                        </p>
                      ) : hasProgress ? (
                        <div>
                          <Progress
                            value={achievement.progress!}
                            max={achievement.maxProgress}
                            size="sm"
                            className="mb-1"
                          />
                          <p className="text-xs text-[#71717a]">
                            {achievement.progress} / {achievement.maxProgress}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-[#71717a]">
                          Complete the challenge to unlock
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card variant="bordered" padding="lg" className="text-center">
            <Trophy className="w-12 h-12 text-[#71717a] mx-auto mb-4" />
            <p className="text-[#a1a1aa]">No achievements available yet</p>
          </Card>
        )}

        {/* Tips */}
        <Card variant="bordered" padding="lg" className="mt-8">
          <h3 className="font-semibold text-white mb-3">Tips to Unlock More Achievements</h3>
          <ul className="space-y-2 text-sm text-[#a1a1aa]">
            <li className="flex items-start gap-2">
              <span className="text-[#8b5cf6]">-</span>
              Practice daily to unlock streak achievements
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8b5cf6]">-</span>
              Focus on accuracy to unlock perfectionist badges
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8b5cf6]">-</span>
              Challenge friends in private sessions for social achievements
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8b5cf6]">-</span>
              Try different difficulty levels to unlock variety badges
            </li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
}

export { AchievementsPage };
