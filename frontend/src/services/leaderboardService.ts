/**
 * Leaderboard Service
 */
import { apiClient } from './api';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardEntryResponse {
  rank: number;
  user_id: string;
  username: string;
  avatar: string | null;
  wpm: number;
  accuracy: number;
  sessions_played: number;
}

interface LeaderboardResponse {
  entries: LeaderboardEntryResponse[];
  total: number;
  page: number;
  pages: number;
}

function mapEntryResponse(response: LeaderboardEntryResponse): LeaderboardEntry {
  return {
    rank: response.rank,
    userId: response.user_id,
    username: response.username,
    avatar: response.avatar || undefined,
    wpm: response.wpm,
    accuracy: response.accuracy,
    sessionsPlayed: response.sessions_played,
  };
}

export const leaderboardService = {
  async getLeaderboard(options?: {
    page?: number;
    limit?: number;
    period?: string;
  }): Promise<{ entries: LeaderboardEntry[]; total: number; page: number; pages: number }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.period) params.append('period', options.period);

    const queryString = params.toString();
    const endpoint = queryString ? `/leaderboard?${queryString}` : '/leaderboard';

    const response = await apiClient.get<LeaderboardResponse>(endpoint);
    return {
      entries: response.entries.map(mapEntryResponse),
      total: response.total,
      page: response.page,
      pages: response.pages,
    };
  },

  async getFriendsLeaderboard(options?: {
    page?: number;
    limit?: number;
  }): Promise<{ entries: LeaderboardEntry[]; total: number; page: number; pages: number }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/leaderboard/friends?${queryString}` : '/leaderboard/friends';

    const response = await apiClient.get<LeaderboardResponse>(endpoint);
    return {
      entries: response.entries.map(mapEntryResponse),
      total: response.total,
      page: response.page,
      pages: response.pages,
    };
  },

  async getMyRank(period?: string): Promise<LeaderboardEntry | null> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);

    const queryString = params.toString();
    const endpoint = queryString ? `/leaderboard/me/rank?${queryString}` : '/leaderboard/me/rank';

    const response = await apiClient.get<LeaderboardEntryResponse | null>(endpoint);
    return response ? mapEntryResponse(response) : null;
  },
};
