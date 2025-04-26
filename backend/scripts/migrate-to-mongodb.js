const { Pool } = require('pg');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {
  User,
  Media,
  Downloads,
  Notifications,
  PersonalVault,
  Requests,
  RSSFeeds,
  UserPreferences
} = require('../models');

dotenv.config();

// PostgreSQL connection
const pgPool = new Pool({
  user: process.env.PG_USER || process.env.DB_USER,
  password: process.env.PG_PASS || process.env.DB_PASS,
  database: process.env.PG_DB || process.env.DB_NAME,
  host: process.env.PG_HOST || process.env.DB_HOST,
  port: process.env.PG_PORT || 5432
});

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Migrate Users
    const users = await pgPool.query('SELECT * FROM users');
    for (const user of users.rows) {
      const mongoUser = new User({
        _id: user.id,
        username: user.username,
        password: user.password,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      });
      await mongoUser.save();
    }
    console.log(`Migrated ${users.rows.length} users`);

    // Migrate Media
    const media = await pgPool.query('SELECT * FROM media');
    for (const item of media.rows) {
      const mongoMedia = new Media({
        _id: item.id,
        title: item.title,
        category: item.category,
        genre: item.genre,
        type: item.type,
        format: item.format,
        filePath: item.file_path,
        thumbnail: item.thumbnail,
        streamPath: item.stream_path,
        metadata: item.metadata,
        createdBy: item.created_by,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      });
      await mongoMedia.save();
    }
    console.log(`Migrated ${media.rows.length} media items`);

    // Migrate Downloads
    const downloads = await pgPool.query('SELECT * FROM downloads');
    for (const download of downloads.rows) {
      const mongoDownload = new Downloads({
        _id: download.id,
        mediaId: download.media_id,
        status: download.status,
        sourceType: download.source_type,
        sourceUrl: download.source_url,
        progress: download.progress,
        error: download.error,
        createdAt: download.created_at,
        updatedAt: download.updated_at
      });
      await mongoDownload.save();
    }
    console.log(`Migrated ${downloads.rows.length} downloads`);

    // Migrate Notifications
    const notifications = await pgPool.query('SELECT * FROM notifications');
    for (const notification of notifications.rows) {
      const mongoNotification = new Notifications({
        _id: notification.id,
        userId: notification.user_id,
        message: notification.message,
        isRead: notification.is_read,
        type: notification.type,
        createdAt: notification.created_at,
        updatedAt: notification.updated_at
      });
      await mongoNotification.save();
    }
    console.log(`Migrated ${notifications.rows.length} notifications`);

    // Migrate Personal Vault
    const vault = await pgPool.query('SELECT * FROM personal_vault');
    for (const item of vault.rows) {
      const mongoVault = new PersonalVault({
        _id: item.id,
        ownerId: item.owner_id,
        mediaPath: item.media_path,
        type: item.type,
        isEncrypted: item.is_encrypted,
        metadata: item.metadata,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      });
      await mongoVault.save();
    }
    console.log(`Migrated ${vault.rows.length} vault items`);

    // Migrate Requests
    const requests = await pgPool.query('SELECT * FROM requests');
    for (const request of requests.rows) {
      const mongoRequest = new Requests({
        _id: request.id,
        userId: request.user_id,
        request: request.request,
        status: request.status,
        notes: request.notes,
        createdAt: request.created_at,
        updatedAt: request.updated_at
      });
      await mongoRequest.save();
    }
    console.log(`Migrated ${requests.rows.length} requests`);

    // Migrate RSS Feeds
    const feeds = await pgPool.query('SELECT * FROM rss_feeds');
    for (const feed of feeds.rows) {
      const mongoFeed = new RSSFeeds({
        _id: feed.id,
        url: feed.url,
        label: feed.label,
        lastChecked: feed.last_checked,
        createdAt: feed.created_at,
        updatedAt: feed.updated_at
      });
      await mongoFeed.save();
    }
    console.log(`Migrated ${feeds.rows.length} RSS feeds`);

    // Migrate User Preferences
    const preferences = await pgPool.query('SELECT * FROM user_preferences');
    for (const pref of preferences.rows) {
      const mongoPref = new UserPreferences({
        _id: pref.id,
        userId: pref.user_id,
        streamingQuality: pref.streaming_quality,
        preferredAudioFormat: pref.preferred_audio_format,
        enableOfflineMode: pref.enable_offline_mode,
        maxDownloadSize: pref.max_download_size,
        notificationSettings: pref.notification_settings,
        uiPreferences: pref.ui_preferences,
        createdAt: pref.created_at,
        updatedAt: pref.updated_at
      });
      await mongoPref.save();
    }
    console.log(`Migrated ${preferences.rows.length} user preferences`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    await pgPool.end();
  }
}

// Run migration
migrateData();