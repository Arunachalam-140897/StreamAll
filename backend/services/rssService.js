const RSSParser = require('rss-parser');
const cron = require('node-cron');
const { RSSFeeds } = require('../models');
const DownloadService = require('./downloadService');
const NotificationService = require('./notificationService');
const { AppError } = require('../utils/errorHandler');
const { logError } = require('../utils/logger');

class RSSService {
  static parser = new RSSParser();
  static isMonitoring = false;

  static async init() {
    // Start RSS monitoring every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      this.checkFeeds().catch(err => 
        logError('RSS feed check failed:', err)
      );
    });
  }

  static async checkFeeds() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    try {
      const feeds = await RSSFeeds.findAll();
      
      for (const feed of feeds) {
        try {
          const feedContent = await this.parser.parseURL(feed.url);
          await this.processNewItems(feed, feedContent.items);
        } catch (error) {
          logError(`Error processing feed ${feed.url}:`, error);
        }
      }
    } catch (error) {
      logError('Feed check failed:', error);
    } finally {
      this.isMonitoring = false;
    }
  }

  static async processNewItems(feed, items) {
    // Get last check timestamp
    const lastCheck = feed.lastChecked || new Date(0);

    for (const item of items) {
      const pubDate = new Date(item.pubDate);
      
      // Skip old items
      if (pubDate <= lastCheck) continue;

      // Check if item matches any download criteria
      if (this.shouldDownload(item)) {
        try {
          const mediaId = await this.createMediaEntry(item);
          await DownloadService.addDownload(
            mediaId,
            {
              sourceType: this.getSourceType(item),
              sourceUrl: this.getDownloadUrl(item)
            },
            feed.createdBy
          );

          await NotificationService.create(
            feed.createdBy,
            `New media download started: ${item.title}`,
            'info'
          );
        } catch (error) {
          logError(`Failed to process RSS item ${item.title}:`, error);
        }
      }
    }

    // Update last check timestamp
    await feed.update({ lastChecked: new Date() });
  }

  static shouldDownload(item) {
    // Implement download criteria based on title, category, etc.
    // This can be enhanced with user-defined rules
    return true;
  }

  static getSourceType(item) {
    const url = this.getDownloadUrl(item);
    if (url.startsWith('magnet:')) return 'magnet';
    if (url.endsWith('.torrent')) return 'torrent';
    return 'direct';
  }

  static getDownloadUrl(item) {
    // Check various RSS feed formats for download links
    return item.enclosure?.url || 
           item.link ||
           item['rss:link']?.href ||
           item.guid;
  }

  static async createMediaEntry(item) {
    // Create a media entry based on RSS item metadata
    const media = await Media.create({
      title: item.title,
      category: this.inferCategory(item),
      type: this.inferType(item),
      format: this.inferFormat(item),
      metadata: {
        description: item.description,
        pubDate: item.pubDate,
        source: item.link
      }
    });

    return media.id;
  }

  static inferCategory(item) {
    // Implement category inference logic based on item metadata
    return 'movie'; // Default category
  }

  static inferType(item) {
    // Implement type inference logic
    return 'video'; // Default type
  }

  static inferFormat(item) {
    // Implement format inference logic
    return 'mp4'; // Default format
  }
}

module.exports = RSSService;