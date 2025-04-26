const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  streamingQuality: {
    type: String,
    default: '720p'
  },
  preferredAudioFormat: {
    type: String,
    default: 'mp3'
  },
  enableOfflineMode: {
    type: Boolean,
    default: false
  },
  maxDownloadSize: {
    type: Number,
    default: 2147483648 // 2GB
  },
  notificationSettings: {
    downloadComplete: { type: Boolean, default: true },
    newContent: { type: Boolean, default: true },
    requestUpdates: { type: Boolean, default: true },
    enablePush: { type: Boolean, default: false }
  },
  uiPreferences: {
    theme: { type: String, default: 'system' },
    listView: { type: String, default: 'grid' },
    sortOrder: { type: String, default: 'dateAdded' },
    showThumbnails: { type: Boolean, default: true },
    autoplay: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);