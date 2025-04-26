const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path');
const { Op } = require('sequelize');
const { Downloads } = require('../models');

class CleanupService {
  static init() {
    // Clean temp files every 12 hours
    cron.schedule('0 */12 * * *', () => {
      this.cleanupTempFiles().catch(console.error);
    });

    // Clean old HLS segments daily
    cron.schedule('0 0 * * *', () => {
      this.cleanupHLSSegments().catch(console.error);
    });

    // Clean failed downloads daily
    cron.schedule('0 0 * * *', () => {
      this.cleanupFailedDownloads().catch(console.error);
    });
  }

  static async cleanupTempFiles() {
    const tempDir = path.join(process.cwd(), 'tmp', 'uploads');
    const threshold = 24 * 60 * 60 * 1000; // 24 hours

    try {
      const files = await fs.readdir(tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > threshold) {
          await fs.remove(filePath);
          console.log(`Cleaned up temp file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  static async cleanupHLSSegments() {
    const hlsDir = path.join(process.env.MEDIA_PATH || './uploads/media', 'hls');
    const threshold = 7 * 24 * 60 * 60 * 1000; // 7 days

    try {
      if (!await fs.pathExists(hlsDir)) return;

      const streams = await fs.readdir(hlsDir);
      const now = Date.now();

      for (const stream of streams) {
        const streamDir = path.join(hlsDir, stream);
        const stats = await fs.stat(streamDir);

        // Only process directories
        if (!stats.isDirectory()) continue;

        const files = await fs.readdir(streamDir);
        for (const file of files) {
          if (!file.endsWith('.ts')) continue;

          const filePath = path.join(streamDir, file);
          const segmentStats = await fs.stat(filePath);

          if (now - segmentStats.mtimeMs > threshold) {
            await fs.remove(filePath);
            console.log(`Cleaned up HLS segment: ${file}`);
          }
        }

        // Remove empty quality directories
        const qualityDirs = await fs.readdir(streamDir);
        for (const qualityDir of qualityDirs) {
          const qualityPath = path.join(streamDir, qualityDir);
          const remaining = await fs.readdir(qualityPath);
          if (remaining.length <= 1) { // Only playlist file remains
            await fs.remove(qualityPath);
            console.log(`Cleaned up empty quality directory: ${qualityDir}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up HLS segments:', error);
    }
  }

  static async cleanupFailedDownloads() {
    try {
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - 7); // 7 days ago

      const failedDownloads = await Downloads.findAll({
        where: {
          status: 'error',
          updatedAt: {
            [Op.lt]: threshold
          }
        }
      });

      for (const download of failedDownloads) {
        await download.destroy();
        console.log(`Cleaned up failed download: ${download.id}`);
      }
    } catch (error) {
      console.error('Error cleaning up failed downloads:', error);
    }
  }
}

module.exports = CleanupService;