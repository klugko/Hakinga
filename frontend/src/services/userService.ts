/**
 * User Service
 */
import { apiClient } from './api';
import type { User, DashboardStats, TypingSession } from '@/types';

interface UserResponse {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  created_at: string;
  stats: {
    avg_wpm: number;
    avg_accuracy: number;
    best_wpm: number;
    total_sessions: number;
    total_time_typed: number;
    total_characters_typed: number;
  };
}

interface DashboardStatsResponse {
  total_sessions: number;
  avg_wpm: number;
  avg_accuracy: number;
  best_wpm: number;
  total_time_typed: number;
  improvement_percent: number;
  recent_sessions: SessionResponse[];
  wpm_trend: WpmDataPointResponse[];
}

interface SessionResponse {
  id: string;
  text_id: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  errors: number;
  total_characters: number;
  duration: number;
  mode: string;
  started_at: string;
  completed_at: string;
}

interface WpmDataPointResponse {
  time: number;
  wpm: number;
  accuracy: number;
}

function mapUserResponse(response: UserResponse): User {
  return {
    id: response.id,
    username: response.username,
    email: response.email,
    avatar: response.avatar || undefined,
    createdAt: response.created_at,
    stats: {
      avgWpm: response.stats.avg_wpm,
      avgAccuracy: response.stats.avg_accuracy,
      bestWpm: response.stats.best_wpm,
      totalSessions: response.stats.total_sessions,
      totalTimeTyped: response.stats.total_time_typed,
      totalCharactersTyped: response.stats.total_characters_typed,
    },
  };
}

function mapSessionResponse(response: SessionResponse): TypingSession {
  return {
    id: response.id,
    userId: '',
    textId: response.text_id,
    text: '',
    wpm: response.wpm,
    rawWpm: response.raw_wpm,
    accuracy: response.accuracy,
    errors: response.errors,
    totalCharacters: response.total_characters,
    correctCharacters: response.total_characters - response.errors,
    duration: response.duration,
    startedAt: response.started_at,
    completedAt: response.completed_at,
    mode: response.mode as 'solo' | 'private' | 'competition',
    wpmHistory: [],
  };
}

function mapDashboardStats(response: DashboardStatsResponse): DashboardStats {
  return {
    totalSessions: response.total_sessions,
    avgWpm: response.avg_wpm,
    avgAccuracy: response.avg_accuracy,
    bestWpm: response.best_wpm,
    totalTimeTyped: response.total_time_typed,
    improvementPercent: response.improvement_percent,
    recentSessions: response.recent_sessions.map(mapSessionResponse),
    wpmTrend: response.wpm_trend.map((p) => ({
      time: p.time,
      wpm: p.wpm,
      accuracy: p.accuracy,
    })),
  };
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<UserResponse>('/users/me');
    return mapUserResponse(response);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStatsResponse>('/users/me/dashboard');
    return mapDashboardStats(response);
  },

  async updateProfile(data: { username?: string; email?: string; avatar?: string }): Promise<User> {
    const response = await apiClient.put<UserResponse>('/users/me', data);
    return mapUserResponse(response);
  },

  async getUserProfile(userId: string): Promise<User> {
    const response = await apiClient.get<UserResponse>(`/users/${userId}`);
    return mapUserResponse(response);
  },

  async searchUsers(query: string): Promise<Array<{ id: string; username: string; avatar?: string; stats: { avgWpm: number; totalSessions: number } }>> {
    const response = await apiClient.get<Array<{ id: string; username: string; avatar: string | null; stats: { avg_wpm: number; total_sessions: number } }>>(`/users/search?q=${encodeURIComponent(query)}`);
    return response.map((u) => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar || undefined,
      stats: {
        avgWpm: u.stats.avg_wpm,
        totalSessions: u.stats.total_sessions,
      },
    }));
  },
};
