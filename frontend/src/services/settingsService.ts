/**
 * Settings Service
 */
import { apiClient } from './api';

export interface UserSettings {
  soundEffects: boolean;
  notifications: boolean;
  showWpmLive: boolean;
  showAccuracyLive: boolean;
  theme: string;
  keyboardLayout: string;
}

interface SettingsResponse {
  sound_effects: boolean;
  notifications: boolean;
  show_wpm_live: boolean;
  show_accuracy_live: boolean;
  theme: string;
  keyboard_layout: string;
}

function mapSettingsResponse(response: SettingsResponse): UserSettings {
  return {
    soundEffects: response.sound_effects,
    notifications: response.notifications,
    showWpmLive: response.show_wpm_live,
    showAccuracyLive: response.show_accuracy_live,
    theme: response.theme,
    keyboardLayout: response.keyboard_layout,
  };
}

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const response = await apiClient.get<SettingsResponse>('/settings');
    return mapSettingsResponse(response);
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const request: Record<string, unknown> = {};
    if (settings.soundEffects !== undefined) request.sound_effects = settings.soundEffects;
    if (settings.notifications !== undefined) request.notifications = settings.notifications;
    if (settings.showWpmLive !== undefined) request.show_wpm_live = settings.showWpmLive;
    if (settings.showAccuracyLive !== undefined) request.show_accuracy_live = settings.showAccuracyLive;
    if (settings.theme !== undefined) request.theme = settings.theme;
    if (settings.keyboardLayout !== undefined) request.keyboard_layout = settings.keyboardLayout;

    const response = await apiClient.put<SettingsResponse>('/settings', request);
    return mapSettingsResponse(response);
  },
};
