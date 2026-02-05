/**
 * Progression Service
 * Handles XP, levels, and ranking data
 */
import { apiClient } from './api';
import type { UserProgress, LevelInfo, RankTier } from '@/types';

interface ProgressResponse {
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  best_streak: number;
  last_session_date: string | null;
  rank_tier: string;
  mmr: number;
  level_info: {
    level: number;
    current_xp: number;
    xp_for_current_level: number;
    xp_for_next_level: number;
    progress_percent: number;
    xp_needed: number;
  };
}

interface LevelInfoResponse {
  level: number;
  current_xp: number;
  xp_for_current_level: number;
  xp_for_next_level: number;
  progress_percent: number;
  xp_needed: number;
}

interface XPLeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar: string | null;
  total_xp: number;
  level: number;
  streak: number;
  rank_tier: string;
}

interface XPLeaderboardResponse {
  entries: XPLeaderboardEntry[];
  user_rank: number | null;
  total_users: number;
}

function mapProgressResponse(response: ProgressResponse): UserProgress {
  return {
    userId: response.user_id,
    totalXp: response.total_xp,
    currentLevel: response.current_level,
    currentStreak: response.current_streak,
    bestStreak: response.best_streak,
    lastSessionDate: response.last_session_date || undefined,
    rankTier: response.rank_tier as RankTier,
    mmr: response.mmr,
    levelInfo: {
      level: response.level_info.level,
      currentXp: response.level_info.current_xp,
      xpForCurrentLevel: response.level_info.xp_for_current_level,
      xpForNextLevel: response.level_info.xp_for_next_level,
      progressPercent: response.level_info.progress_percent,
      xpNeeded: response.level_info.xp_needed,
    },
  };
}

function mapLevelInfoResponse(response: LevelInfoResponse): LevelInfo {
  return {
    level: response.level,
    currentXp: response.current_xp,
    xpForCurrentLevel: response.xp_for_current_level,
    xpForNextLevel: response.xp_for_next_level,
    progressPercent: response.progress_percent,
    xpNeeded: response.xp_needed,
  };
}

export const progressionService = {
  async getMyProgress(): Promise<UserProgress> {
    const response = await apiClient.get<ProgressResponse>('/progression/me');
    return mapProgressResponse(response);
  },

  async getMyLevel(): Promise<LevelInfo> {
    const response = await apiClient.get<LevelInfoResponse>('/progression/level');
    return mapLevelInfoResponse(response);
  },

  async getXPLeaderboard(options?: {
    page?: number;
    limit?: number;
  }): Promise<{
    entries: Array<{
      rank: number;
      userId: string;
      username: string;
      avatar?: string;
      totalXp: number;
      level: number;
      streak: number;
      rankTier: RankTier;
    }>;
    userRank: number | null;
    totalUsers: number;
  }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/progression/leaderboard/xp?${queryString}`
      : '/progression/leaderboard/xp';

    const response = await apiClient.get<XPLeaderboardResponse>(endpoint);

    return {
      entries: response.entries.map((e) => ({
        rank: e.rank,
        userId: e.user_id,
        username: e.username,
        avatar: e.avatar || undefined,
        totalXp: e.total_xp,
        level: e.level,
        streak: e.streak,
        rankTier: e.rank_tier as RankTier,
      })),
      userRank: response.user_rank,
      totalUsers: response.total_users,
    };
  },

  async getRankedLeaderboard(options?: {
    page?: number;
    limit?: number;
  }): Promise<{
    entries: Array<{
      rank: number;
      userId: string;
      username: string;
      avatar?: string;
      mmr: number;
      rankTier: RankTier;
      level: number;
    }>;
    totalUsers: number;
  }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/progression/leaderboard/ranked?${queryString}`
      : '/progression/leaderboard/ranked';

    interface RankLeaderboardEntry {
      rank: number;
      user_id: string;
      username: string;
      avatar: string | null;
      mmr: number;
      rank_tier: string;
      level: number;
    }

    interface RankLeaderboardResponse {
      entries: RankLeaderboardEntry[];
      total_users: number;
    }

    const response = await apiClient.get<RankLeaderboardResponse>(endpoint);

    return {
      entries: response.entries.map((e) => ({
        rank: e.rank,
        userId: e.user_id,
        username: e.username,
        avatar: e.avatar || undefined,
        mmr: e.mmr,
        rankTier: e.rank_tier as RankTier,
        level: e.level,
      })),
      totalUsers: response.total_users,
    };
  },
};
