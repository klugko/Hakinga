import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Gauge, Target, Clock, Trophy, Keyboard, Users, TrendingUp, ArrowRight, Play, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, Button, Badge, Progress } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { userService, achievementService } from '@/services';
import { formatTime, formatRelativeTime } from '@/lib/utils';
import type { DashboardStats, Achievement } from '@/types';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dashboardStats, userAchievements] = await Promise.all([
          userService.getDashboardStats(),
          achievementService.getAchievements(),
        ]);

        setStats(dashboardStats);
        setAchievements(userAchievements);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
        </div>
      </Layout>
    );
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card variant="bordered" padding="lg" className="text-center">
            <p className="text-[#ef4444] mb-4">{error || 'Failed to load data'}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-[#a1a1aa] mt-1">
            Ready to improve your typing skills today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/solo">
            <Card
              variant="bordered"
              padding="lg"
              className="group hover:border-[#8b5cf6]/50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Keyboard className="w-6 h-6 text-[#8b5cf6]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Solo Practice</h3>
                    <p className="text-sm text-[#a1a1aa]">Practice at your own pace</p>
                  </div>
                </div>
                <Play className="w-5 h-5 text-[#8b5cf6] group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          <Link to="/private/create">
            <Card
              variant="bordered"
              padding="lg"
              className="group hover:border-[#22c55e]/50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#22c55e]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-[#22c55e]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Private Race</h3>
                    <p className="text-sm text-[#a1a1aa]">Challenge your friends</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#22c55e] group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
                <Gauge className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{Math.round(stats.avgWpm)}</p>
                <p className="text-xs text-[#a1a1aa]">Avg WPM</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#22c55e]/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{Math.round(stats.avgAccuracy)}%</p>
                <p className="text-xs text-[#a1a1aa]">Accuracy</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.bestWpm}</p>
                <p className="text-xs text-[#a1a1aa]">Best WPM</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatTime(stats.totalTimeTyped)}</p>
                <p className="text-xs text-[#a1a1aa]">Total Time</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* WPM Trend Chart */}
          <Card variant="bordered" padding="lg" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">WPM Trend</h3>
              <Badge variant="success">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{stats.improvementPercent}%
              </Badge>
            </div>
            <div className="h-[250px]">
              {stats.wpmTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.wpmTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis
                      dataKey="time"
                      stroke="#71717a"
                      fontSize={12}
                      tickFormatter={(value) => `Day ${value}`}
                    />
                    <YAxis stroke="#71717a" fontSize={12} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value) => `Day ${value}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="wpm"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#8b5cf6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[#71717a]">
                  Complete some sessions to see your progress
                </div>
              )}
            </div>
          </Card>

          {/* Achievements */}
          <Card variant="bordered" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Achievements</h3>
              <Link to="/achievements" className="text-sm text-[#8b5cf6] hover:text-[#a78bfa]">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {achievements.length > 0 ? (
                achievements.slice(0, 4).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#252525] transition-colors"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{achievement.name}</p>
                      {achievement.unlockedAt ? (
                        <p className="text-xs text-[#22c55e]">Unlocked</p>
                      ) : achievement.progress !== undefined && achievement.maxProgress ? (
                        <Progress
                          value={achievement.progress}
                          max={achievement.maxProgress}
                          size="sm"
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-xs text-[#71717a]">Locked</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#71717a] text-sm">No achievements yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card variant="bordered" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
            <Link to="/history" className="text-sm text-[#8b5cf6] hover:text-[#a78bfa]">
              View all
            </Link>
          </div>
          {stats.recentSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#71717a] border-b border-[#2a2a2a]">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Mode</th>
                    <th className="pb-3 font-medium">WPM</th>
                    <th className="pb-3 font-medium">Accuracy</th>
                    <th className="pb-3 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSessions.map((session) => (
                    <tr key={session.id} className="border-b border-[#2a2a2a] last:border-0">
                      <td className="py-3 text-sm text-[#a1a1aa]">
                        {formatRelativeTime(session.completedAt)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            session.mode === 'solo'
                              ? 'primary'
                              : session.mode === 'private'
                              ? 'success'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {session.mode}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm font-medium text-white">{session.wpm} WPM</td>
                      <td className="py-3 text-sm text-white">{session.accuracy}%</td>
                      <td className="py-3 text-sm text-[#a1a1aa]">{formatTime(session.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#71717a] text-center py-4">No sessions yet. Start practicing!</p>
          )}
        </Card>
      </div>
    </Layout>
  );
}

export { DashboardPage };
