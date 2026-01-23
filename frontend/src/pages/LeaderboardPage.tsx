import { useState } from 'react';
import { Trophy, Medal, Crown, Gauge, Target, Calendar, User } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, Tabs, TabsList, TabsTrigger, TabsContent, Avatar, Badge } from '@/components/ui';
import { mockLeaderboard, cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

function LeaderboardPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('all');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-[#f59e0b]" />;
      case 2:
        return <Medal className="w-5 h-5 text-[#a1a1aa]" />;
      case 3:
        return <Medal className="w-5 h-5 text-[#b45309]" />;
      default:
        return <span className="text-[#71717a] font-medium">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-[#f59e0b]/20 to-transparent border-l-4 border-l-[#f59e0b]';
      case 2:
        return 'bg-gradient-to-r from-[#a1a1aa]/10 to-transparent border-l-4 border-l-[#a1a1aa]';
      case 3:
        return 'bg-gradient-to-r from-[#b45309]/20 to-transparent border-l-4 border-l-[#b45309]';
      default:
        return '';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f59e0b]/20 rounded-2xl mb-4">
            <Trophy className="w-8 h-8 text-[#f59e0b]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-[#a1a1aa] mt-1">See how you rank against other typists</p>
        </div>

        {/* Time Range Tabs */}
        <Tabs defaultValue="all" onChange={setTimeRange} className="mb-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <LeaderboardList entries={mockLeaderboard} currentUserId={user?.id} />
          </TabsContent>
          <TabsContent value="month">
            <LeaderboardList entries={mockLeaderboard.slice(0, 8)} currentUserId={user?.id} />
          </TabsContent>
          <TabsContent value="week">
            <LeaderboardList entries={mockLeaderboard.slice(0, 6)} currentUserId={user?.id} />
          </TabsContent>
          <TabsContent value="today">
            <LeaderboardList entries={mockLeaderboard.slice(0, 4)} currentUserId={user?.id} />
          </TabsContent>
        </Tabs>

        {/* Your Rank Card */}
        {user && (
          <Card variant="bordered" padding="lg" className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#8b5cf6]" />
              Your Position
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center font-bold text-[#8b5cf6]">
                  #10
                </div>
                <div>
                  <p className="font-semibold text-white">{user.username}</p>
                  <p className="text-sm text-[#a1a1aa]">{user.stats.totalSessions} sessions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{user.stats.bestWpm} WPM</p>
                <p className="text-sm text-[#a1a1aa]">{user.stats.avgAccuracy}% accuracy</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

interface LeaderboardListProps {
  entries: typeof mockLeaderboard;
  currentUserId?: string;
}

function LeaderboardList({ entries, currentUserId }: LeaderboardListProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-[#f59e0b]" />;
      case 2:
        return <Medal className="w-5 h-5 text-[#a1a1aa]" />;
      case 3:
        return <Medal className="w-5 h-5 text-[#b45309]" />;
      default:
        return <span className="w-5 text-center text-[#71717a] font-medium">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-[#f59e0b]/20 to-transparent border-l-4 border-l-[#f59e0b]';
      case 2:
        return 'bg-gradient-to-r from-[#a1a1aa]/10 to-transparent border-l-4 border-l-[#a1a1aa]';
      case 3:
        return 'bg-gradient-to-r from-[#b45309]/20 to-transparent border-l-4 border-l-[#b45309]';
      default:
        return '';
    }
  };

  return (
    <Card variant="bordered" padding="none">
      <div className="divide-y divide-[#2a2a2a]">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={cn(
              'flex items-center gap-4 p-4 hover:bg-[#1a1a1a]/50 transition-colors',
              getRankBg(entry.rank),
              currentUserId === entry.userId && 'bg-[#8b5cf6]/10'
            )}
          >
            {/* Rank */}
            <div className="w-10 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 flex-1">
              <Avatar name={entry.username} size="md" />
              <div>
                <p className={cn(
                  'font-medium',
                  currentUserId === entry.userId ? 'text-[#8b5cf6]' : 'text-white'
                )}>
                  {entry.username}
                  {currentUserId === entry.userId && (
                    <Badge variant="primary" size="sm" className="ml-2">You</Badge>
                  )}
                </p>
                <p className="text-sm text-[#71717a]">{entry.sessionsPlayed} sessions</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="font-bold text-white text-lg">{entry.wpm}</p>
                <p className="text-[#71717a] flex items-center gap-1">
                  <Gauge className="w-3 h-3" /> WPM
                </p>
              </div>
              <div className="text-center">
                <p className="font-bold text-[#22c55e] text-lg">{entry.accuracy}%</p>
                <p className="text-[#71717a] flex items-center gap-1">
                  <Target className="w-3 h-3" /> Acc
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export { LeaderboardPage };
