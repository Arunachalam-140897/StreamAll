const { UserPreferences } = require('../models');
const { AppError } = require('../utils/errorHandler');

class UserPreferencesService {
  static async getPreferences(userId) {
    let preferences = await UserPreferences.findOne({
      where: { userId }
    });

    if (!preferences) {
      preferences = await UserPreferences.create({ userId });
    }

    return preferences;
  }

  static async updatePreferences(userId, updates) {
    const preferences = await this.getPreferences(userId);

    // Handle nested updates for JSONB fields
    if (updates.notificationSettings) {
      updates.notificationSettings = {
        ...preferences.notificationSettings,
        ...updates.notificationSettings
      };
    }

    if (updates.uiPreferences) {
      updates.uiPreferences = {
        ...preferences.uiPreferences,
        ...updates.uiPreferences
      };
    }

    await preferences.update(updates);
    return preferences;
  }

  static async updateStreamingQuality(userId, quality) {
    const validQualities = ['360p', '480p', '720p', '1080p'];
    if (!validQualities.includes(quality)) {
      throw new AppError('Invalid streaming quality', 400);
    }

    return this.updatePreferences(userId, { streamingQuality: quality });
  }

  static async updateNotificationSettings(userId, settings) {
    return this.updatePreferences(userId, {
      notificationSettings: settings
    });
  }

  static async updateUiPreferences(userId, preferences) {
    return this.updatePreferences(userId, {
      uiPreferences: preferences
    });
  }

  static async toggleOfflineMode(userId) {
    const preferences = await this.getPreferences(userId);
    return this.updatePreferences(userId, {
      enableOfflineMode: !preferences.enableOfflineMode
    });
  }

  static async setMaxDownloadSize(userId, size) {
    if (size < 0 || size > 10737418240) { // Max 10GB
      throw new AppError('Invalid download size limit', 400);
    }

    return this.updatePreferences(userId, { maxDownloadSize: size });
  }
}