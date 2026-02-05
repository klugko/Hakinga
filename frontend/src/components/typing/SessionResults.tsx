import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Target, Clock, Keyboard, TrendingUp, RotateCcw, Home, RefreshCw } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { formatTime, cn } from '@/lib/utils';
import type { WpmDataPoint } from '@/types';

interface SessionResultsProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  totalCharacters: number;
  wpmHistory: WpmDataPoint[];
  onRetry: () => void;
  onHome: () => void;
  onNewText?: () => void;
  personalBest?: number;
}

function SessionResults({
  wpm,
  rawWpm,
  accuracy,
  errors,
  duration,
  totalCharacters,
  wpmHistory,
  onRetry,
  onHome,
  onNewText,
  personalBest,
}: SessionResultsProps) {
  const isNewRecord = personalBest !== undefined && wpm > personalBest;

  // Calculate rating based on WPM
  const rating = useMemo(() => {
    if (wpm >= 100) return { label: 'Expert', color: 'text-[#8b5cf6]', bg: 'bg-[#8b5cf6]/20' };
    if (wpm >= 80) return { label: 'Advanced', color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/20' };
    if (wpm >= 60) return { label: 'Intermediate', color: 'text-[#3b82f6]', bg: 'bg-[#3b82f6]/20' };
    if (wpm >= 40) return { label: 'Beginner', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/20' };
    return { label: 'Learning', color: 'text-[#a1a1aa]', bg: 'bg-[#a1a1aa]/20' };
  }, [wpm]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (wpmHistory.length === 0) return [];
    return wpmHistory.map(point => ({
      time: point.time,
      wpm: point.wpm,
      accuracy: point.accuracy,
    }));
  }, [wpmHistory]);

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fadeIn">
      {/* Header with main score */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Session Complete!</h1>
        {isNewRecord && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f59e0b]/20 rounded-full mb-4">
            <Trophy className="w-5 h-5 text-[#f59e0b]" />
            <span className="text-[#f59e0b] font-semibold">New Personal Best!</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <div className="text-[80px] font-bold text-white leading-none">
            {wpm}
          </div>
          <div className="text-xl text-[#a1a1aa]">WPM</div>
          <Badge className={cn(rating.bg, rating.color)}>{rating.label}</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card variant="bordered" padding="md" className="text-center">
          <Target className="w-6 h-6 text-[#22c55e] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{accuracy}%</div>
          <div className="text-sm text-[#a1a1aa]">Accuracy</div>
        </Card>

        <Card variant="bordered" padding="md" className="text-center">
          <Keyboard className="w-6 h-6 text-[#8b5cf6] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{rawWpm}</div>
          <div className="text-sm text-[#a1a1aa]">Raw WPM</div>
        </Card>

        <Card variant="bordered" padding="md" className="text-center">
          <Clock className="w-6 h-6 text-[#3b82f6] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{formatTime(duration)}</div>
          <div className="text-sm text-[#a1a1aa]">Duration</div>
        </Card>

        <Card variant="bordered" padding="md" className="text-center">
          <TrendingUp className="w-6 h-6 text-[#ef4444] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{errors}</div>
          <div className="text-sm text-[#a1a1aa]">Errors</div>
        </Card>
      </div>

      {/* WPM Chart */}
      {chartData.length > 1 && (
        <Card variant="bordered" padding="lg" className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">WPM Over Time</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis
                  dataKey="time"
                  stroke="#71717a"
                  fontSize={12}
                  tickFormatter={(value) => `${value}s`}
                />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(value) => `Time: ${value}s`}
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
          </div>
        </Card>
      )}

      {/* Additional Stats */}
      <Card variant="bordered" padding="lg" className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-[#a1a1aa]">Characters</div>
            <div className="text-lg font-semibold text-white">{totalCharacters}</div>
          </div>
          <div>
            <div className="text-sm text-[#a1a1aa]">Correct</div>
            <div className="text-lg font-semibold text-[#22c55e]">{totalCharacters - errors}</div>
          </div>
          <div>
            <div className="text-sm text-[#a1a1aa]">Errors</div>
            <div className="text-lg font-semibold text-[#ef4444]">{errors}</div>
          </div>
          <div>
            <div className="text-sm text-[#a1a1aa]">Speed</div>
            <div className="text-lg font-semibold text-white">
              {Math.round(totalCharacters / duration * 60)} CPM
            </div>
          </div>
          <div>
            <div className="text-sm text-[#a1a1aa]">Consistency</div>
            <div className="text-lg font-semibold text-white">
              {chartData.length > 1
                ? `${Math.round((1 - (Math.max(...chartData.map(d => d.wpm)) - Math.min(...chartData.map(d => d.wpm))) / wpm) * 100)}%`
                : '100%'}
            </div>
          </div>
          {personalBest !== undefined && (
            <div>
              <div className="text-sm text-[#a1a1aa]">Personal Best</div>
              <div className="text-lg font-semibold text-[#f59e0b]">{Math.max(wpm, personalBest)} WPM</div>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="primary"
          size="lg"
          leftIcon={<RotateCcw className="w-5 h-5" />}
          onClick={onRetry}
        >
          Try Again
        </Button>
        {onNewText && (
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<RefreshCw className="w-5 h-5" />}
            onClick={onNewText}
          >
            New Quote
          </Button>
        )}
        <Button
          variant="ghost"
          size="lg"
          leftIcon={<Home className="w-5 h-5" />}
          onClick={onHome}
        >
          Back to Practice
        </Button>
      </div>
    </div>
  );
}

export { SessionResults };
