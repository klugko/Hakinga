/**
 * Typing Session Service
 */
import { apiClient } from './api';
import type { TypingSession, WpmDataPoint } from '@/types';

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
  }): Promise<TypingSession> {
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
    };
    const response = await apiClient.post<SessionResponse>('/sessions', request);
    return mapSessionResponse(response);
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
