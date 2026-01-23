import { useState, useMemo } from 'react';
import { History, Filter, ArrowUpDown, Calendar, Gauge, Target, Clock } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, Badge, Button, Select } from '@/components/ui';
import { mockSessions, formatDate, formatTime, formatRelativeTime } from '@/lib/utils';
import type { HistoryFilter, TypingSession } from '@/types';

function HistoryPage() {
  const [filter, setFilter] = useState<HistoryFilter>({
    mode: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let sessions = [...mockSessions];

    // Filter by mode
    if (filter.mode !== 'all') {
      sessions = sessions.filter(s => s.mode === filter.mode);
    }

    // Filter by date range
    if (filter.dateRange !== 'all') {
      const now = new Date();
      const ranges: Record<string, number> = {
        today: 1,
        week: 7,
        month: 30,
      };
      const days = ranges[filter.dateRange];
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      sessions = sessions.filter(s => new Date(s.completedAt) >= cutoff);
    }

    // Sort
    sessions.sort((a, b) => {
      let comparison = 0;
      switch (filter.sortBy) {
        case 'date':
          comparison = new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
          break;
        case 'wpm':
          comparison = b.wpm - a.wpm;
          break;
        case 'accuracy':
          comparison = b.accuracy - a.accuracy;
          break;
      }
      return filter.sortOrder === 'desc' ? comparison : -comparison;
    });

    return sessions;
  }, [filter]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (filteredSessions.length === 0) {
      return { avgWpm: 0, avgAccuracy: 0, totalTime: 0, count: 0 };
    }

    const totalWpm = filteredSessions.reduce((sum, s) => sum + s.wpm, 0);
    const totalAccuracy = filteredSessions.reduce((sum, s) => sum + s.accuracy, 0);
    const totalTime = filteredSessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      avgWpm: Math.round(totalWpm / filteredSessions.length),
      avgAccuracy: Math.round(totalAccuracy / filteredSessions.length),
      totalTime,
      count: filteredSessions.length,
    };
  }, [filteredSessions]);

  const modeOptions = [
    { value: 'all', label: 'All Modes' },
    { value: 'solo', label: 'Solo' },
    { value: 'private', label: 'Private' },
    { value: 'competition', label: 'Competition' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'wpm', label: 'WPM' },
    { value: 'accuracy', label: 'Accuracy' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <History className="w-8 h-8 text-[#8b5cf6]" />
              Session History
            </h1>
            <p className="text-[#a1a1aa] mt-1">
              Review your past typing sessions and track your progress
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summaryStats.count}</p>
                <p className="text-xs text-[#a1a1aa]">Sessions</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#22c55e]/20 rounded-lg flex items-center justify-center">
                <Gauge className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summaryStats.avgWpm}</p>
                <p className="text-xs text-[#a1a1aa]">Avg WPM</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summaryStats.avgAccuracy}%</p>
                <p className="text-xs text-[#a1a1aa]">Avg Accuracy</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatTime(summaryStats.totalTime)}</p>
                <p className="text-xs text-[#a1a1aa]">Total Time</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="bordered" padding="md" className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-[#a1a1aa]">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select
              options={modeOptions}
              value={filter.mode}
              onChange={(e) => setFilter(prev => ({ ...prev, mode: e.target.value as HistoryFilter['mode'] }))}
              className="w-36"
            />

            <Select
              options={dateRangeOptions}
              value={filter.dateRange}
              onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as HistoryFilter['dateRange'] }))}
              className="w-36"
            />

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-[#a1a1aa]">Sort by:</span>
              <Select
                options={sortOptions}
                value={filter.sortBy}
                onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value as HistoryFilter['sortBy'] }))}
                className="w-28"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter(prev => ({ ...prev, sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc' }))}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sessions List */}
        <Card variant="bordered" padding="none">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-[#71717a] mx-auto mb-4" />
              <p className="text-[#a1a1aa]">No sessions found matching your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a2a]">
              {filteredSessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}

function SessionRow({ session }: { session: TypingSession }) {
  return (
    <div className="p-4 hover:bg-[#1a1a1a]/50 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <div className="w-12 h-12 bg-[#252525] rounded-lg flex items-center justify-center">
              <Gauge className="w-6 h-6 text-[#8b5cf6]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white">{session.wpm} WPM</span>
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
            </div>
            <p className="text-sm text-[#a1a1aa]">
              {formatDate(session.completedAt)} ({formatRelativeTime(session.completedAt)})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-[#22c55e] font-medium">{session.accuracy}%</p>
            <p className="text-xs text-[#71717a]">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-[#ef4444] font-medium">{session.errors}</p>
            <p className="text-xs text-[#71717a]">Errors</p>
          </div>
          <div className="text-center">
            <p className="text-[#3b82f6] font-medium">{formatTime(session.duration)}</p>
            <p className="text-xs text-[#71717a]">Duration</p>
          </div>
          <div className="text-center">
            <p className="text-white font-medium">{session.totalCharacters}</p>
            <p className="text-xs text-[#71717a]">Chars</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { HistoryPage };
