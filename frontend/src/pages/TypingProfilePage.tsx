import { Keyboard, Gauge, Target, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Layout } from '@/components/layout';
import { Card, Progress } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

const skillData = [
  { skill: 'Speed', value: 75 },
  { skill: 'Accuracy', value: 94 },
  { skill: 'Consistency', value: 82 },
  { skill: 'Endurance', value: 68 },
  { skill: 'Recovery', value: 71 },
  { skill: 'Focus', value: 85 },
];

const weeklyProgress = [
  { day: 'Mon', wpm: 72, accuracy: 93 },
  { day: 'Tue', wpm: 75, accuracy: 94 },
  { day: 'Wed', wpm: 74, accuracy: 92 },
  { day: 'Thu', wpm: 78, accuracy: 95 },
  { day: 'Fri', wpm: 76, accuracy: 94 },
  { day: 'Sat', wpm: 80, accuracy: 96 },
  { day: 'Sun', wpm: 79, accuracy: 95 },
];

const fingerStats = [
  { finger: 'Left Pinky', accuracy: 89, speed: 65 },
  { finger: 'Left Ring', accuracy: 92, speed: 72 },
  { finger: 'Left Middle', accuracy: 95, speed: 78 },
  { finger: 'Left Index', accuracy: 96, speed: 82 },
  { finger: 'Right Index', accuracy: 97, speed: 84 },
  { finger: 'Right Middle', accuracy: 96, speed: 80 },
  { finger: 'Right Ring', accuracy: 93, speed: 74 },
  { finger: 'Right Pinky', accuracy: 88, speed: 62 },
];

function TypingProfilePage() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8b5cf6]/20 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-[#8b5cf6]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Typing Profile</h1>
          <p className="text-[#a1a1aa] mt-1">
            Detailed analysis of your typing performance
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
                <Gauge className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{user?.stats.avgWpm || 75}</p>
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
                <p className="text-2xl font-bold text-white">{user?.stats.avgAccuracy || 94}%</p>
                <p className="text-xs text-[#a1a1aa]">Accuracy</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">+12%</p>
                <p className="text-xs text-[#a1a1aa]">Improvement</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{user?.stats.totalSessions || 42}</p>
                <p className="text-xs text-[#a1a1aa]">Sessions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skill Radar */}
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-white mb-4">Skill Analysis</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData}>
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                  />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weekly Progress */}
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="wpm"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 0 }}
                    name="WPM"
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 0 }}
                    name="Accuracy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Finger Analysis */}
        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-white mb-4">Finger Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fingerStats.map((stat) => (
              <div key={stat.finger} className="p-3 bg-[#0f0f0f] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{stat.finger}</span>
                  <span className="text-sm text-[#a1a1aa]">{stat.accuracy}% accuracy</span>
                </div>
                <Progress
                  value={stat.accuracy}
                  size="sm"
                  variant={stat.accuracy >= 95 ? 'success' : stat.accuracy >= 90 ? 'default' : 'warning'}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg">
            <h4 className="font-medium text-[#f59e0b] mb-2">Suggestion</h4>
            <p className="text-sm text-[#a1a1aa]">
              Your pinky fingers need more practice. Try the "Home Row Mastery" training to improve pinky accuracy.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export { TypingProfilePage };
