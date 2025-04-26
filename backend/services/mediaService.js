const { Media, Downloads, UserPreferences } = require('../models');
const { AppError } = require('../utils/errorHandler');
const fs = require('fs-extra');
const path = require('path');
const MediaProcessor = require('../utils/mediaProcessor');
const { v4: uuidv4 } = require('uuid');

class MediaService {
  static async create(data, file, adminId) {
    const { title, category, genre, type, format } = data;

    // Create media directory if it doesn't exist
    const mediaDir = path.resolve(process.env.MEDIA_PATH || './uploads/media');
    const thumbnailDir = path.join(mediaDir, 'thumbnails');
    await fs.ensureDir(mediaDir);
    await fs.ensureDir(thumbnailDir);

    // Generate unique filename
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(mediaDir, fileName);

    // Move file to media directory
    await fs.move(file.path, filePath);

    // Extract metadata
    const metadata = await MediaProcessor.getMediaMetadata(filePath);

    // Generate thumbnail and HLS streams for videos
    let thumbnail;
    let streamPath;
    try {
      if (type === 'video') {
        // Generate thumbnail
        const thumbFileName = `${path.basename(fileName, path.extname(fileName))}.jpg`;
        const thumbPath = path.join(thumbnailDir, thumbFileName);
        await MediaProcessor.generateVideoThumbnail(filePath, thumbPath);
        thumbnail = `thumbnails/${thumbFileName}`;

        // Generate HLS streams for adaptive streaming
        const hlsDir = path.join(mediaDir, 'hls', path.basename(fileName, path.extname(fileName)));
        streamPath = await MediaProcessor.generateHLSStream(filePath, hlsDir);
      } else if (type === 'audio') {
        // For audio files, you might want to generate a waveform image as thumbnail
        // This would require additional processing
        thumbnail = null;
      }
    } catch (error) {
      console.error('Media processing failed:', error);
      // Clean up files if processing failed
      await fs.remove(filePath);
      throw new AppError('Failed to process media file: ' + error.message, 500);
    }

    return Media.create({
      title,
      category,
      genre: Array.isArray(genre) ? genre : [genre],
      type,
      format,
      filePath: fileName,
      thumbnail,
      streamPath: streamPath ? path.relative(mediaDir, streamPath) : null,
      metadata,
      createdBy: adminId
    });
  }

  static async getAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      type,
      genre,
      search
    } = options;

    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (genre) query.genre = genre;
    if (search) {
      query.$text = { $search: search };
    }

    const [total, items] = await Promise.all([
      Media.countDocuments(query),
      Media.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    ]);

    return {
      rows: items,
      count: total
    };
  }

  static async getById(id) {
    const media = await Media.findById(id);
    if (!media) {
      throw new AppError('Media not found', 404);
    }
    return media;
  }

  static async update(id, data, adminId) {
    const media = await this.getById(id);
    
    if (media.createdBy.toString() !== adminId) {
      throw new AppError('You are not authorized to update this media', 403);
    }

    Object.assign(media, data);
    return media.save();
  }

  static async delete(id, adminId) {
    const media = await this.getById(id);
    
    if (media.createdBy.toString() !== adminId) {
      throw new AppError('You are not authorized to delete this media', 403);
    }

    const mediaDir = path.resolve(process.env.MEDIA_PATH || './uploads/media');
    
    try {
      // Delete media file
      await fs.remove(path.join(mediaDir, media.filePath));
      
      // Delete thumbnail if exists
      if (media.thumbnail) {
        await fs.remove(path.join(mediaDir, media.thumbnail));
      }

      // Delete HLS streams if they exist
      if (media.streamPath) {
        await fs.remove(path.dirname(path.join(mediaDir, media.streamPath)));
      }

      await media.deleteOne();
      return { message: 'Media deleted successfully' };
    } catch (error) {
      throw new AppError('Error deleting media files', 500);
    }
  }

  static async getStreamUrl(id, userId) {
    const [media, preferences] = await Promise.all([
      this.getById(id),
      UserPreferences.findOne({ userId })
    ]);

    const mediaDir = path.resolve(process.env.MEDIA_PATH || './uploads/media');

    // Use user's preferred quality for HLS streams
    if (media.streamPath) {
      const streamDir = path.dirname(path.join(mediaDir, media.streamPath));
      const quality = preferences?.streamingQuality || '720p';
      
      // Find closest available quality
      const qualities = await this.getAvailableQualities(streamDir);
      const targetQuality = this.findClosestQuality(qualities, quality);
      
      if (targetQuality) {
        const qualityPlaylist = path.join(streamDir, targetQuality, 'playlist.m3u8');
        if (await fs.pathExists(qualityPlaylist)) {
          return {
            streamUrl: path.relative(mediaDir, qualityPlaylist),
            mimeType: 'application/x-mpegURL',
            isHLS: true
          };
        }
      }

      // Fallback to master playlist if specific quality not found
      if (await fs.pathExists(path.join(mediaDir, media.streamPath))) {
        return {
          streamUrl: media.streamPath,
          mimeType: 'application/x-mpegURL',
          isHLS: true
        };
      }
    }
    
    // For audio files, check preferred format
    if (media.type === 'audio' && preferences?.preferredAudioFormat) {
      const convertedPath = await this.getConvertedAudio(
        media,
        preferences.preferredAudioFormat
      );
      if (convertedPath) {
        return {
          streamUrl: convertedPath,
          mimeType: this.getMimeType(preferences.preferredAudioFormat),
          isHLS: false
        };
      }
    }

    // Fallback to direct file
    const mediaPath = path.join(mediaDir, media.filePath);
    if (!await fs.pathExists(mediaPath)) {
      throw new AppError('Media file not found', 404);
    }
    
    return {
      streamUrl: mediaPath,
      mimeType: this.getMimeType(media.format),
      isHLS: false
    };
  }

  static async getAvailableQualities(streamDir) {
    try {
      const items = await fs.readdir(streamDir);
      return items.filter(item => 
        fs.statSync(path.join(streamDir, item)).isDirectory() &&
        /^\d+x\d+$/.test(item)
      );
    } catch {
      return [];
    }
  }

  static findClosestQuality(qualities, target) {
    if (!qualities.length) return null;
    
    // Convert target (e.g., '720p') to height
    const targetHeight = parseInt(target);
    if (isNaN(targetHeight)) return qualities[0];

    // Find closest match
    return qualities.reduce((prev, curr) => {
      const prevHeight = parseInt(prev.split('x')[1]);
      const currHeight = parseInt(curr.split('x')[1]);
      
      return Math.abs(currHeight - targetHeight) < Math.abs(prevHeight - targetHeight)
        ? curr
        : prev;
    });
  }

  static async getConvertedAudio(media, targetFormat) {
    if (media.format === targetFormat) {
      return media.filePath;
    }

    const mediaDir = path.resolve(process.env.MEDIA_PATH || './uploads/media');
    const originalPath = path.join(mediaDir, media.filePath);
    const convertedFileName = `${path.basename(media.filePath, path.extname(media.filePath))}.${targetFormat}`;
    const convertedPath = path.join(mediaDir, 'converted', convertedFileName);

    // Check if converted file already exists
    if (await fs.pathExists(convertedPath)) {
      return path.relative(mediaDir, convertedPath);
    }

    // Convert file
    try {
      await fs.ensureDir(path.dirname(convertedPath));
      await MediaProcessor.extractAudio(originalPath, convertedPath, {
        format: targetFormat
      });
      return path.relative(mediaDir, convertedPath);
    } catch (error) {
      console.error('Audio conversion failed:', error);
      return null;
    }
  }

  static getMimeType(format) {
    const mimeTypes = {
      'mp4': 'video/mp4',
      'mkv': 'video/x-matroska',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mp3': 'audio/mpeg',
      'flac': 'audio/flac',
      'wav': 'audio/wav',
      'aac': 'audio/aac'
    };
    return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
  }
}

module.exports = MediaService;