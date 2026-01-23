/**
 * Achievement Service
 */
import { apiClient } from './api';
import type { Achievement } from '@/types';

interface AchievementResponse {
  id: string;
  name: string;
  description: string;
  icon: string;
  max_progress: number | null;
  progress: number;
  unlocked_at: string | null;
}

function mapAchievementResponse(response: AchievementResponse): Achievement {
  return {
    id: response.id,
    name: response.name,
    description: response.description,
    icon: response.icon,
    maxProgress: response.max_progress || undefined,
    progress: response.progress || undefined,
    unlockedAt: response.unlocked_at || undefined,
  };
}

export const achievementService = {
  async getAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<AchievementResponse[]>('/achievements');
    return response.map(mapAchievementResponse);
  },

  async getAvailableAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<AchievementResponse[]>('/achievements/available');
    return response.map(mapAchievementResponse);
  },
};
