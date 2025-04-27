import api from './api';
import type { UserPreferences } from '../types/preferences';

export const userPreferencesService = {
  async getPreferences() {
    const response = await api.get('/preferences');
    return response.data;
  },

  async updatePreferences(preferences: Partial<UserPreferences>) {
    const response = await api.patch('/preferences', preferences);
    return response.data;
  },

  async updateStreamingQuality(quality: string) {
    const response = await api.patch('/preferences/streaming-quality', { quality });
    return response.data;
  },

  async updateNotificationSettings(settings: any) {
    const response = await api.patch('/preferences/notifications', settings);
    return response.data;
  },

  async updateUiPreferences(preferences: any) {
    const response = await api.patch('/preferences/ui', preferences);
    return response.data;
  },

  async toggleOfflineMode() {
    const response = await api.patch('/preferences/offline-mode');
    return response.data;
  }
};

export default userPreferencesService;