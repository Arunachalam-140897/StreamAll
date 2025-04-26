const mongoose = require('mongoose');

// Define Config Schema
const configSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);

class ConfigService {
  static async init() {
    // Create default config if it doesn't exist
    try {
      const defaultConfig = this.getDefaultConfig();
      for (const [key, value] of Object.entries(defaultConfig)) {
        await this.setWithoutOverwrite(key, value);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  static getDefaultConfig() {
    return {
      streaming: {
        maxBitrate: '2000k',
        defaultQuality: '720p',
        hlsSegmentDuration: 10,
        qualities: [
          { resolution: '1280x720', bitrate: '2000k' },
          { resolution: '854x480', bitrate: '1000k' },
          { resolution: '640x360', bitrate: '500k' }
        ]
      },
      storage: {
        maxFileSize: 2147483648, // 2GB
        allowedVideoFormats: ['mp4', 'mkv', 'mov', 'avi'],
        allowedAudioFormats: ['mp3', 'flac', 'wav', 'aac'],
        retentionPeriod: {
          tempFiles: 24, // hours
          hlsSegments: 168 // hours (7 days)
        }
      },
      security: {
        jwtExpiresIn: '7d',
        maxLoginAttempts: 5,
        lockoutDuration: 15, // minutes
        allowedOrigins: ['http://localhost:3000']
      },
      downloads: {
        maxConcurrent: 3,
        retryAttempts: 3,
        timeout: 3600 // seconds
      },
      notifications: {
        enabled: true,
        pushEnabled: false,
        cleanupAge: 30 // days
      },
      maintenance: {
        backupSchedule: '0 0 * * 0', // Weekly on Sunday
        cleanupSchedule: '0 0 * * *', // Daily at midnight
        maxBackupAge: 30 // days
      }
    };
  }

  static async setWithoutOverwrite(key, value) {
    const existingConfig = await Config.findOne({ key });
    if (!existingConfig) {
      await Config.create({ key, value });
    }
  }

  static async get(key) {
    if (!key) {
      const configs = await Config.find();
      return configs.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
    }

    const parts = key.split('.');
    const config = await Config.findOne({ key: parts[0] });
    if (!config) return null;

    let value = config.value;
    for (let i = 1; i < parts.length; i++) {
      value = value?.[parts[i]];
      if (value === undefined) return null;
    }

    return value;
  }

  static async update(key, value) {
    const parts = key.split('.');
    const rootKey = parts[0];

    if (parts.length === 1) {
      // Direct update
      await Config.findOneAndUpdate(
        { key: rootKey },
        { value },
        { upsert: true, new: true }
      );
    } else {
      // Nested update
      const config = await Config.findOne({ key: rootKey });
      let current = config?.value || {};
      let target = current;

      // Navigate to the nested property
      for (let i = 1; i < parts.length - 1; i++) {
        target[parts[i]] = target[parts[i]] || {};
        target = target[parts[i]];
      }

      // Set the value
      target[parts[parts.length - 1]] = value;

      // Update the document
      await Config.findOneAndUpdate(
        { key: rootKey },
        { value: current },
        { upsert: true, new: true }
      );
    }

    return this.get(rootKey);
  }

  static validateConfig(config) {
    // Add validation logic here if needed
    return true;
  }
}

module.exports = ConfigService;