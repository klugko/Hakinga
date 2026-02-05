/**
 * Typing Session Service
 */
import { apiClient } from './api';
import type { TypingSession, WpmDataPoint, SessionWithXP, XPBreakdown, LevelInfo } from '@/types';

interface SessionResponse {
  id: string;
  user_id: string;
  text_id: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  errors: number;
  total_characters: number;
  correct_characters: number;
  duration: number;
  started_at: string;
  completed_at: string;
  mode: string;
  wpm_history: Array<{ time: number; wpm: number; accuracy: number }>;
}

interface SessionWithXPResponse extends SessionResponse {
  max_combo: number;
  xp_earned: number;
  xp_breakdown?: {
    base_xp: number;
    difficulty_multiplier: number;
    mode_multiplier: number;
    streak_bonus: number;
    perfect_accuracy_bonus: number;
    personal_best_bonus: number;
    total_xp: number;
  };
  level_info?: {
    level: number;
    current_xp: number;
    xp_for_current_level: number;
    xp_for_next_level: number;
    progress_percent: number;
    xp_needed: number;
  };
  leveled_up: boolean;
  new_level?: number;
  new_streak: number;
}

interface SessionListResponse {
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
  max_combo?: number;
  xp_earned?: number;
}

interface SessionHistoryResponse {
  sessions: SessionListResponse[];
  total: number;
  page: number;
  pages: number;
}

interface CreateSessionRequest {
  text_id: string;
  text: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  errors: number;
  total_characters: number;
  correct_characters: number;
  duration: number;
  wpm_history: Array<{ time: number; wpm: number; accuracy: number }>;
  max_combo: number;
  difficulty: string;
}

function mapSessionResponse(response: SessionResponse): TypingSession {
  return {
    id: response.id,
    userId: response.user_id,
    textId: response.text_id,
    text: '',
    wpm: response.wpm,
    rawWpm: response.raw_wpm,
    accuracy: response.accuracy,
    errors: response.errors,
    totalCharacters: response.total_characters,
    correctCharacters: response.correct_characters,
    duration: response.duration,
    startedAt: response.started_at,
    completedAt: response.completed_at,
    mode: response.mode as 'solo' | 'private' | 'competition',
    wpmHistory: response.wpm_history.map((h) => ({
      time: h.time,
      wpm: h.wpm,
      accuracy: h.accuracy,
    })),
  };
}

function mapSessionWithXPResponse(response: SessionWithXPResponse): SessionWithXP {
  const baseSession = mapSessionResponse(response);

  let xpBreakdown: XPBreakdown | undefined;
  if (response.xp_breakdown) {
    xpBreakdown = {
      baseXp: response.xp_breakdown.base_xp,
      difficultyMultiplier: response.xp_breakdown.difficulty_multiplier,
      modeMultiplier: response.xp_breakdown.mode_multiplier,
      streakBonus: response.xp_breakdown.streak_bonus,
      perfectAccuracyBonus: response.xp_breakdown.perfect_accuracy_bonus,
      personalBestBonus: response.xp_breakdown.personal_best_bonus,
      totalXp: response.xp_breakdown.total_xp,
    };
  }

  let levelInfo: LevelInfo | undefined;
  if (response.level_info) {
    levelInfo = {
      level: response.level_info.level,
      currentXp: response.level_info.current_xp,
      xpForCurrentLevel: response.level_info.xp_for_current_level,
      xpForNextLevel: response.level_info.xp_for_next_level,
      progressPercent: response.level_info.progress_percent,
      xpNeeded: response.level_info.xp_needed,
    };
  }

  return {
    ...baseSession,
    maxCombo: response.max_combo || 0,
    xpEarned: response.xp_earned || 0,
    xpBreakdown,
    levelInfo,
    leveledUp: response.leveled_up || false,
    newLevel: response.new_level,
    newStreak: response.new_streak || 0,
  };
}

function mapSessionListResponse(response: SessionListResponse): TypingSession {
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

export const sessionService = {
  async createSession(data: {
    textId: string;
    text: string;
    wpm: number;
    rawWpm: number;
    accuracy: number;
    errors: number;
    totalCharacters: number;
    correctCharacters: number;
    duration: number;
    wpmHistory: WpmDataPoint[];
    maxCombo?: number;
    difficulty?: string;
  }): Promise<SessionWithXP> {
    const request: CreateSessionRequest = {
      text_id: data.textId,
      text: data.text,
      wpm: data.wpm,
      raw_wpm: data.rawWpm,
      accuracy: data.accuracy,
      errors: data.errors,
      total_characters: data.totalCharacters,
      correct_characters: data.correctCharacters,
      duration: data.duration,
      wpm_history: data.wpmHistory.map((h) => ({
        time: h.time,
        wpm: h.wpm,
        accuracy: h.accuracy,
      })),
      max_combo: data.maxCombo || 0,
      difficulty: data.difficulty || 'medium',
    };
    const response = await apiClient.post<SessionWithXPResponse>('/sessions', request);
    return mapSessionWithXPResponse(response);
  },

  async getSessionHistory(options?: {
    page?: number;
    limit?: number;
    mode?: string;
  }): Promise<{ sessions: TypingSession[]; total: number; page: number; pages: number }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.mode && options.mode !== 'all') params.append('mode', options.mode);

    const queryString = params.toString();
    const endpoint = queryString ? `/sessions?${queryString}` : '/sessions';

    const response = await apiClient.get<SessionHistoryResponse>(endpoint);
    return {
      sessions: response.sessions.map(mapSessionListResponse),
      total: response.total,
      page: response.page,
      pages: response.pages,
    };
  },

  async getSession(sessionId: string): Promise<TypingSession> {
    const response = await apiClient.get<SessionResponse>(`/sessions/${sessionId}`);
    return mapSessionResponse(response);
  },
};
