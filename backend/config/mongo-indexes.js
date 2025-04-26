const mongoose = require('mongoose');
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

async function createIndexes() {
  try {
    // Media indexes
    await Media.collection.createIndexes([
      { key: { title: 'text' } },
      { key: { category: 1 } },
      { key: { type: 1 } },
      { key: { createdBy: 1 } }
    ]);

    // Downloads indexes
    await Downloads.collection.createIndexes([
      { key: { mediaId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } }
    ]);

    // Notifications indexes
    await Notifications.collection.createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { userId: 1, isRead: 1 } }
    ]);

    // PersonalVault indexes
    await PersonalVault.collection.createIndexes([
      { key: { ownerId: 1, createdAt: -1 } },
      { key: { type: 1 } }
    ]);

    // Requests indexes
    await Requests.collection.createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { status: 1 } }
    ]);

    // RSSFeeds indexes
    await RSSFeeds.collection.createIndexes([
      { key: { url: 1 }, unique: true },
      { key: { lastChecked: 1 } }
    ]);

    // UserPreferences indexes
    await UserPreferences.collection.createIndexes([
      { key: { userId: 1 }, unique: true }
    ]);

    // User indexes (username is already indexed due to unique constraint)
    await User.collection.createIndexes([
      { key: { role: 1 } }
    ]);

    console.log('All MongoDB indexes created successfully');
  } catch (error) {
    console.error('Error creating MongoDB indexes:', error);
    throw error;
  }
}

module.exports = createIndexes;