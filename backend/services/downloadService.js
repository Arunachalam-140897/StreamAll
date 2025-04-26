const Aria2 = require('aria2');
const path = require('path');
const fs = require('fs-extra');
const { Downloads, Media, UserPreferences } = require('../models');
const { AppError } = require('../utils/errorHandler');
const NotificationService = require('./notificationService');

class DownloadService {
  static aria2;

  static async init() {
    this.aria2 = new Aria2({
      host: 'localhost',
      port: process.env.ARIA2_PORT || 6800,
      secure: false,
      secret: process.env.ARIA2_SECRET,
      path: '/jsonrpc'
    });

    try {
      await this.aria2.open();
    } catch (error) {
      console.error('Failed to connect to aria2:', error);
      throw new AppError('Download service initialization failed', 500);
    }

    // Set up download event handlers
    this.aria2.on('onDownloadStart', ([{ gid }]) => this._handleDownloadStart(gid));
    this.aria2.on('onDownloadComplete', ([{ gid }]) => this._handleDownloadComplete(gid));
    this.aria2.on('onDownloadError', ([{ gid }]) => this._handleDownloadError(gid));
  }

  static async addDownload(mediaId, { sourceType, sourceUrl }, userId) {
    // Check user preferences first
    const preferences = await UserPreferences.findOne({ where: { userId } });
    
    if (preferences?.maxDownloadSize) {
      try {
        // Get file size before downloading
        const fileInfo = await this.getFileInfo(sourceUrl);
        if (fileInfo.size > preferences.maxDownloadSize) {
          throw new AppError(
            `File size (${Math.round(fileInfo.size / 1024 / 1024)}MB) exceeds your download limit ` +
            `(${Math.round(preferences.maxDownloadSize / 1024 / 1024)}MB)`,
            400
          );
        }
      } catch (error) {
        if (!(error instanceof AppError)) {
          console.warn('Could not check file size before download:', error);
        } else {
          throw error;
        }
      }
    }

    const download = await Downloads.create({
      mediaId,
      sourceType,
      sourceUrl,
      status: 'pending'
    });

    const downloadDir = path.resolve(process.env.MEDIA_PATH || './uploads/media');
    await fs.ensureDir(downloadDir);

    try {
      const options = {
        dir: downloadDir,
        'user-agent': 'Mozilla/5.0 StreamCloud/1.0',
        'max-download-limit': preferences?.maxDownloadSize ? 
          Math.floor(preferences.maxDownloadSize / 1024) + 'K' : '0'
      };

      let gid;
      if (sourceType === 'magnet' || sourceType === 'torrent') {
        gid = await this.aria2.addUri([sourceUrl], options);
      } else if (sourceType === 'direct') {
        gid = await this.aria2.addUri([sourceUrl], options);
      } else {
        throw new AppError('Invalid source type', 400);
      }

      await download.update({ 
        status: 'downloading',
        aria2_gid: gid
      });

      // Only notify if user has notifications enabled
      if (preferences?.notificationSettings?.downloadComplete) {
        await NotificationService.create(
          userId,
          `Download started for media ID: ${mediaId}`,
          'info'
        );
      }

      return download;
    } catch (error) {
      await download.update({
        status: 'error',
        error: error.message
      });
      throw new AppError('Failed to start download: ' + error.message, 500);
    }
  }

  static async getFileInfo(url) {
    if (url.startsWith('magnet:')) {
      throw new AppError('Cannot determine size of magnet link before downloading', 400);
    }

    return new Promise((resolve, reject) => {
      this.aria2.getOption()
        .then(() => this.aria2.addUri([url], { 'dry-run': true }))
        .then(async (gid) => {
          const status = await this.aria2.tellStatus(gid);
          resolve({
            size: parseInt(status.totalLength),
            filename: status.files[0]?.path
          });
        })
        .catch(reject);
    });
  }

  static async getStatus(downloadId) {
    const download = await Downloads.findByPk(downloadId);
    if (!download) {
      throw new AppError('Download not found', 404);
    }

    if (download.status === 'downloading' && download.aria2_gid) {
      try {
        const status = await this.aria2.tellStatus(download.aria2_gid);
        const progress = parseInt(status.completedLength) / parseInt(status.totalLength) * 100;
        await download.update({ progress });
      } catch (error) {
        console.error('Failed to get aria2 status:', error);
      }
    }

    return download;
  }

  static async cancelDownload(downloadId, userId) {
    const download = await Downloads.findByPk(downloadId);
    if (!download) {
      throw new AppError('Download not found', 404);
    }

    if (download.status === 'downloading' && download.aria2_gid) {
      try {
        await this.aria2.remove(download.aria2_gid);
      } catch (error) {
        console.error('Failed to cancel aria2 download:', error);
      }
    }

    await download.update({ 
      status: 'error',
      error: 'Download cancelled by user'
    });

    const preferences = await UserPreferences.findOne({ where: { userId } });
    if (preferences?.notificationSettings?.downloadComplete) {
      await NotificationService.create(
        userId,
        `Download cancelled for media ID: ${download.mediaId}`,
        'warning'
      );
    }

    return { message: 'Download cancelled successfully' };
  }

  static async _handleDownloadStart(gid) {
    const download = await Downloads.findOne({ where: { aria2_gid: gid } });
    if (download) {
      await download.update({ status: 'downloading', progress: 0 });
    }
  }

  static async _handleDownloadComplete(gid) {
    const download = await Downloads.findOne({ where: { aria2_gid: gid } });
    if (download) {
      await download.update({ status: 'done', progress: 100 });
      
      // Update media status
      const media = await Media.findByPk(download.mediaId);
      if (media) {
        const status = await this.aria2.tellStatus(gid);
        const files = status.files || [];
        if (files.length > 0) {
          const mainFile = files[0];
          await media.update({
            filePath: path.basename(mainFile.path)
          });
        }
      }

      // Notify user if they have notifications enabled
      const preferences = await UserPreferences.findOne({
        where: { userId: media.createdBy }
      });

      if (preferences?.notificationSettings?.downloadComplete) {
        await NotificationService.create(
          media.createdBy,
          `Download completed: ${media.title}`,
          'success'
        );
      }
    }
  }

  static async _handleDownloadError(gid) {
    const download = await Downloads.findOne({ where: { aria2_gid: gid } });
    if (download) {
      const status = await this.aria2.tellStatus(gid);
      await download.update({
        status: 'error',
        error: status.errorMessage || 'Unknown error occurred'
      });

      // Notify user of error if they have notifications enabled
      const media = await Media.findByPk(download.mediaId);
      if (media) {
        const preferences = await UserPreferences.findOne({
          where: { userId: media.createdBy }
        });

        if (preferences?.notificationSettings?.downloadComplete) {
          await NotificationService.create(
            media.createdBy,
            `Download failed: ${media.title} - ${status.errorMessage || 'Unknown error'}`,
            'error'
          );
        }
      }
    }
  }
}

module.exports = DownloadService;