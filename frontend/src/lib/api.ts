import type {
  ApiError,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  User,
  UserStats,
  Session,
  SessionResult,
  Text,
  Difficulty,
  TextLength,
  TextCategory,
  PaginatedResponse,
  PrivateSession,
  PublicSession,
  RaceResult,
  LeaderboardEntry,
  LeaderboardPeriod,
  Friend,
  FriendRequest,
  Achievement,
  TypingProfile,
  Drill,
  TrainingPlan,
  DailyInsight,
  WpmPrediction,
  Notification,
  Keystroke,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Token storage utilities
 */
const TOKEN_KEY = 'hakinga_access_token';
const REFRESH_TOKEN_KEY = 'hakinga_refresh_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearStoredTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
  public statusCode: number;
  public apiError: ApiError;

  constructor(statusCode: number, apiError: ApiError) {
    super(apiError.message);
    this.statusCode = statusCode;
    this.apiError = apiError;
    this.name = 'ApiException';
  }
}

/**
 * Base fetch wrapper with authentication and error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(endpoint, options);
    }
    clearStoredTokens();
    window.location.href = '/login';
    throw new ApiException(401, { message: 'Session expiree' });
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'Une erreur est survenue',
    }));
    throw new ApiException(response.status, error);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const tokens: AuthTokens = await response.json();
    setStoredToken(tokens.accessToken);
    setStoredRefreshToken(tokens.refreshToken);
    return true;
  } catch {
    return false;
  }
}

/**
 * Authentication API
 */
export const authApi = {
  async register(credentials: RegisterCredentials): Promise<AuthTokens> {
    const tokens = await apiFetch<AuthTokens>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setStoredToken(tokens.accessToken);
    setStoredRefreshToken(tokens.refreshToken);
    return tokens;
  },

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const tokens = await apiFetch<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setStoredToken(tokens.accessToken);
    setStoredRefreshToken(tokens.refreshToken);
    return tokens;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      clearStoredTokens();
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

/**
 * User API
 */
export const userApi = {
  async getMe(): Promise<User> {
    return apiFetch<User>('/users/me');
  },

  async getProfile(): Promise<User & { stats: UserStats }> {
    return apiFetch('/users/me/profile');
  },

  async updateProfile(data: { username: string }): Promise<User> {
    return apiFetch<User>('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiFetch('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  async deleteAccount(password: string): Promise<void> {
    await apiFetch('/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
    clearStoredTokens();
  },

  async searchUsers(query: string): Promise<User[]> {
    return apiFetch<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },

  async checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
    return apiFetch(`/users/check-username?username=${encodeURIComponent(username)}`);
  },
};

/**
 * Sessions API
 */
export const sessionsApi = {
  async startSoloSession(
    difficulty: Difficulty,
    length: TextLength,
    category?: TextCategory
  ): Promise<{ sessionId: string; text: Text }> {
    return apiFetch('/sessions/solo/start', {
      method: 'POST',
      body: JSON.stringify({ difficulty, length, category }),
    });
  },

  async completeSoloSession(
    sessionId: string,
    keystrokes: Keystroke[]
  ): Promise<SessionResult> {
    return apiFetch(`/sessions/solo/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ keystrokes }),
    });
  },

  async abandonSoloSession(sessionId: string): Promise<void> {
    await apiFetch(`/sessions/solo/${sessionId}/abandon`, {
      method: 'POST',
    });
  },

  async getHistory(params: {
    page?: number;
    pageSize?: number;
    difficulty?: Difficulty;
    days?: number;
  }): Promise<PaginatedResponse<Session>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params.difficulty) searchParams.set('difficulty', params.difficulty);
    if (params.days) searchParams.set('days', params.days.toString());
    return apiFetch(`/sessions/solo/history?${searchParams.toString()}`);
  },

  async getSession(sessionId: string): Promise<Session & { keystrokes: Keystroke[] }> {
    return apiFetch(`/sessions/${sessionId}`);
  },

  async sendKeystrokes(sessionId: string, keystrokes: Keystroke[]): Promise<void> {
    await apiFetch(`/sessions/${sessionId}/keystrokes`, {
      method: 'POST',
      body: JSON.stringify({ keystrokes }),
    });
  },
};

/**
 * Private Sessions API
 */
export const privateSessionsApi = {
  async create(config: {
    difficulty: Difficulty;
    length: TextLength;
    maxParticipants: number;
  }): Promise<PrivateSession> {
    return apiFetch('/sessions/private/create', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  async join(code: string): Promise<PrivateSession> {
    return apiFetch(`/sessions/private/${code}/join`, {
      method: 'POST',
    });
  },

  async getSession(code: string): Promise<PrivateSession> {
    return apiFetch(`/sessions/private/${code}`);
  },

  async setReady(code: string, ready: boolean): Promise<void> {
    await apiFetch(`/sessions/private/${code}/ready`, {
      method: 'POST',
      body: JSON.stringify({ ready }),
    });
  },

  async start(code: string): Promise<void> {
    await apiFetch(`/sessions/private/${code}/start`, {
      method: 'POST',
    });
  },

  async leave(code: string): Promise<void> {
    await apiFetch(`/sessions/private/${code}/leave`, {
      method: 'POST',
    });
  },

  async finish(
    code: string,
    keystrokes: Keystroke[]
  ): Promise<RaceResult[]> {
    return apiFetch(`/sessions/private/${code}/finish`, {
      method: 'POST',
      body: JSON.stringify({ keystrokes }),
    });
  },
};

/**
 * Public Sessions API
 */
export const publicSessionsApi = {
  async joinQueue(difficulty: Difficulty): Promise<{ queueId: string }> {
    return apiFetch('/sessions/public/queue', {
      method: 'POST',
      body: JSON.stringify({ difficulty }),
    });
  },

  async cancelQueue(): Promise<void> {
    await apiFetch('/sessions/public/cancel-queue', {
      method: 'POST',
    });
  },

  async getSession(sessionId: string): Promise<PublicSession> {
    return apiFetch(`/sessions/public/${sessionId}`);
  },

  async finish(
    sessionId: string,
    keystrokes: Keystroke[]
  ): Promise<RaceResult[]> {
    return apiFetch(`/sessions/public/${sessionId}/finish`, {
      method: 'POST',
      body: JSON.stringify({ keystrokes }),
    });
  },
};

/**
 * Leaderboard API
 */
export const leaderboardApi = {
  async getGlobal(
    period: LeaderboardPeriod = 'all_time',
    limit: number = 100
  ): Promise<{ entries: LeaderboardEntry[]; userRank?: number }> {
    return apiFetch(`/leaderboard/global?period=${period}&limit=${limit}`);
  },

  async getWeekly(): Promise<{ entries: LeaderboardEntry[]; userRank?: number }> {
    return apiFetch('/leaderboard/weekly');
  },

  async getFriends(period: LeaderboardPeriod = 'all_time'): Promise<LeaderboardEntry[]> {
    return apiFetch(`/leaderboard/friends?period=${period}`);
  },
};

/**
 * Friends API
 */
export const friendsApi = {
  async getFriends(): Promise<Friend[]> {
    return apiFetch('/friends');
  },

  async getPendingRequests(): Promise<FriendRequest[]> {
    return apiFetch('/friends/requests/pending');
  },

  async sendRequest(userId: string): Promise<FriendRequest> {
    return apiFetch('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  async acceptRequest(requestId: string): Promise<void> {
    await apiFetch(`/friends/accept/${requestId}`, {
      method: 'POST',
    });
  },

  async rejectRequest(requestId: string): Promise<void> {
    await apiFetch(`/friends/reject/${requestId}`, {
      method: 'POST',
    });
  },

  async removeFriend(friendId: string): Promise<void> {
    await apiFetch(`/friends/${friendId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Achievements API
 */
export const achievementsApi = {
  async getAll(): Promise<Achievement[]> {
    return apiFetch('/achievements');
  },

  async getUserAchievements(): Promise<Achievement[]> {
    return apiFetch('/achievements/user');
  },
};

/**
 * ML/Analytics API
 */
export const mlApi = {
  async getTypingProfile(): Promise<TypingProfile> {
    return apiFetch('/ml/users/me/full-profile');
  },

  async getErrorProfile(): Promise<{ chars: Array<{ char: string; errorRate: number; frequency: number }> }> {
    return apiFetch('/ml/users/me/error-profile');
  },

  async getDifficultSequences(): Promise<{ sequences: Array<{ sequence: string; avgTime: number; errorRate: number; type: string }> }> {
    return apiFetch('/ml/users/me/difficult-sequences');
  },

  async getRecommendedDifficulty(): Promise<{ difficulty: Difficulty; reason: string }> {
    return apiFetch('/ml/users/me/recommended-difficulty');
  },

  async getTargetedText(): Promise<Text & { targetedWeaknesses: string[] }> {
    return apiFetch('/ml/users/me/targeted-text');
  },

  async generateDrill(): Promise<Drill> {
    return apiFetch('/ml/users/me/generate-drill', { method: 'POST' });
  },

  async getTrainingPlan(): Promise<TrainingPlan> {
    return apiFetch('/ml/users/me/training-plan');
  },

  async completeTrainingDay(dayNumber: number): Promise<void> {
    await apiFetch('/ml/users/me/training-plan/complete-day', {
      method: 'POST',
      body: JSON.stringify({ dayNumber }),
    });
  },

  async getDailyInsight(): Promise<DailyInsight | null> {
    return apiFetch('/ml/users/me/daily-insight');
  },

  async dismissInsight(insightId: string): Promise<void> {
    await apiFetch(`/ml/insights/${insightId}/dismiss`, {
      method: 'POST',
    });
  },

  async getWpmPrediction(): Promise<WpmPrediction | null> {
    return apiFetch('/ml/users/me/wpm-prediction');
  },

  async checkFatigue(sessionId: string): Promise<{ fatigueDetected: boolean; suggestion?: string }> {
    return apiFetch(`/ml/sessions/${sessionId}/check-fatigue`, {
      method: 'POST',
    });
  },

  async getSessionExplanation(sessionId: string): Promise<{ explanations: string[]; tips: string[] }> {
    return apiFetch(`/ml/sessions/${sessionId}/explain`, {
      method: 'POST',
    });
  },
};

/**
 * Notifications API
 */
export const notificationsApi = {
  async getAll(): Promise<Notification[]> {
    return apiFetch('/notifications');
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return apiFetch('/notifications/unread-count');
  },

  async markAsRead(notificationId: string): Promise<void> {
    await apiFetch(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  async markAllAsRead(): Promise<void> {
    await apiFetch('/notifications/read-all', {
      method: 'POST',
    });
  },
};

/**
 * Texts API
 */
export const textsApi = {
  async getRandomText(
    difficulty: Difficulty,
    length: TextLength,
    category?: TextCategory
  ): Promise<Text> {
    const params = new URLSearchParams({
      difficulty,
      length,
    });
    if (category) params.set('category', category);
    return apiFetch(`/texts/random?${params.toString()}`);
  },
};
