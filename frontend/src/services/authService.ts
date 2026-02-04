/**
 * Authentication Service
 */
import { apiClient } from './api';
import type { User } from '@/types';

export interface AuthResponse {
  user: UserResponse;
  access_token: string;
  refresh_token: string;
}

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

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
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

export const authService = {
  async register(data: RegisterRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    apiClient.setAccessToken(response.access_token);
    return {
      user: mapUserResponse(response.user),
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };
  },

  async login(data: LoginRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    apiClient.setAccessToken(response.access_token);
    return {
      user: mapUserResponse(response.user),
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.setAccessToken(null);
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, new_password: newPassword });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};
