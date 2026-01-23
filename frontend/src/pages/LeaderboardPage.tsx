import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Crown, TrendingUp, Users } from 'lucide-react';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types';

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: '1', username: 'SpeedMaster', totalPoints: 12450, racesCount: 342, avgWpm: 125 },
  { rank: 2, userId: '2', username: 'TypeNinja', totalPoints: 11200, racesCount: 298, avgWpm: 118 },
  { rank: 3, userId: '3', username: 'KeyboardWizard', totalPoints: 10800, racesCount: 276, avgWpm: 112 },
  { rank: 4, userId: '4', username: 'RapidTyper', totalPoints: 9500, racesCount: 245, avgWpm: 105 },
  { rank: 5, userId: '5', username: 'FlashFingers', totalPoints: 8900, racesCount: 223, avgWpm: 102 },
  { rank: 6, userId: '6', username: 'TurboKeys', totalPoints: 8200, racesCount: 198, avgWpm: 98 },
  { rank: 7, userId: '7', username: 'SwiftTypist', totalPoints: 7600, racesCount: 187, avgWpm: 95 },
  { rank: 8, userId: '8', username: 'QuickHands', totalPoints: 7100, racesCount: 172, avgWpm: 92 },
  { rank: 9, userId: '9', username: 'ProTyper', totalPoints: 6500, racesCount: 156, avgWpm: 89 },
  { rank: 10, userId: '10', username: 'KeyMaster', totalPoints: 6000, racesCount: 143, avgWpm: 86 },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-silver" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-bronze" />;
  return null;
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return 'bg-gold/10 border-gold/30';
  if (rank === 2) return 'bg-silver/10 border-silver/30';
  if (rank === 3) return 'bg-bronze/10 border-bronze/30';
  return 'bg-surface-hover border-transparent';
};

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId;
        return (
          <div
            key={entry.userId}
            className={cn(
              'flex items-center gap-4 p-4 rounded-lg border transition-colors',
              getRankStyle(entry.rank),
              isCurrentUser && 'ring-2 ring-primary'
            )}
          >
            <div className="w-12 text-center">
              {getRankIcon(entry.rank) || (
                <span className="text-lg font-bold text-text-muted">#{entry.rank}</span>
              )}
            </div>

            <Avatar fallback={entry.username} size="md" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('font-semibold truncate', isCurrentUser && 'text-primary')}>
                  {entry.username}
                </span>
                {isCurrentUser && <Badge variant="primary" size="sm">Vous</Badge>}
              </div>
              <p className="text-sm text-text-muted">{entry.racesCount} courses</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-text">{entry.totalPoints.toLocaleString()}</p>
              <p className="text-sm text-text-muted">points</p>
            </div>

            <div className="text-right hidden sm:block">
              <p className="font-semibold text-accent">{entry.avgWpm}</p>
              <p className="text-sm text-text-muted">WPM moy.</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Leaderboard page showing rankings
 */
export function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>('all_time');

  const userRank = 1247;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-4">
          <Trophy className="w-5 h-5 text-gold" />
          <span className="text-gold font-medium">Classement</span>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">Meilleurs joueurs</h1>
        <p className="text-text-secondary">
          Comparez vos performances avec les meilleurs dactylographes
        </p>
      </div>

      {user && (
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Votre position</p>
                <p className="text-3xl font-bold text-text">#{userRank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Points totaux</p>
              <p className="text-2xl font-bold text-primary">2,450</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="global">
        <TabsList className="mb-6">
          <TabsTrigger value="global">
            <Trophy className="w-4 h-4 mr-2" />
            Global
          </TabsTrigger>
          <TabsTrigger value="friends">
            <Users className="w-4 h-4 mr-2" />
            Amis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top 100 Global</CardTitle>
                <div className="flex gap-2">
                  {(['all_time', 'monthly', 'weekly'] as LeaderboardPeriod[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={cn(
                        'px-3 py-1 text-sm rounded-md transition-colors',
                        period === p
                          ? 'bg-primary text-white'
                          : 'text-text-secondary hover:bg-surface-hover'
                      )}
                    >
                      {p === 'all_time' ? 'Tout' : p === 'monthly' ? 'Mois' : 'Semaine'}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={mockLeaderboard} currentUserId={user?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>Classement Amis</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text mb-2">Pas encore d'amis</h3>
                  <p className="text-text-secondary">
                    Ajoutez des amis pour voir ce classement
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-text-secondary">
                    Connectez-vous pour voir le classement de vos amis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
