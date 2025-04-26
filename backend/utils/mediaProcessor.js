const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs-extra');
const { AppError } = require('./errorHandler');

// Configure ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

class MediaProcessor {
  static async generateVideoThumbnail(videoPath, outputPath, options = {}) {
    const {
      timestamp = '00:00:02',
      size = '300x169'
    } = options;

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new AppError('Thumbnail generation failed: ' + err.message, 500)));
    });
  }

  static async getMediaMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new AppError('Failed to read media metadata: ' + err.message, 500));
          return;
        }

        const stream = metadata.streams[0];
        const format = metadata.format;

        resolve({
          duration: format.duration,
          bitrate: format.bit_rate,
          size: format.size,
          codec: stream.codec_name,
          width: stream.width,
          height: stream.height,
          fps: stream.r_frame_rate,
          sampleRate: stream.sample_rate,
          channels: stream.channels,
          container: format.format_name,
          tags: format.tags || {}
        });
      });
    });
  }

  static async generateHLSStream(inputPath, outputDir, options = {}) {
    const {
      segmentDuration = 10,
      qualities = [
        { resolution: '1920x1080', bitrate: '4000k', audioBitrate: '192k' },
        { resolution: '1280x720', bitrate: '2800k', audioBitrate: '128k' },
        { resolution: '854x480', bitrate: '1400k', audioBitrate: '128k' },
        { resolution: '640x360', bitrate: '800k', audioBitrate: '96k' }
      ]
    } = options;

    await fs.ensureDir(outputDir);

    const masterPlaylist = ['#EXTM3U', '#EXT-X-VERSION:3'];
    const qualityPromises = qualities.map(async (quality) => {
      const qualityDir = path.join(outputDir, quality.resolution);
      await fs.ensureDir(qualityDir);

      const playlistPath = path.join(qualityDir, 'playlist.m3u8');
      const [width, height] = quality.resolution.split('x');

      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .addOptions([
            '-profile:v main',
            '-sc_threshold 0',
            '-g 48',
            '-keyint_min 48',
            '-hls_time ' + segmentDuration,
            '-hls_list_size 0',
            '-hls_segment_filename ' + path.join(qualityDir, 'segment_%03d.ts')
          ])
          .outputOptions([
            '-c:v h264',
            '-c:a aac',
            '-ar 48000',
            '-b:v ' + quality.bitrate,
            '-b:a ' + quality.audioBitrate,
            '-maxrate ' + parseInt(quality.bitrate) * 1.07 + 'k',
            '-bufsize ' + parseInt(quality.bitrate) * 1.5 + 'k',
            '-vf scale=' + width + ':' + height + ':force_original_aspect_ratio=decrease,pad=' + width + ':' + height + ':(ow-iw)/2:(oh-ih)/2'
          ])
          .output(playlistPath)
          .on('end', () => {
            masterPlaylist.push(
              '#EXT-X-STREAM-INF:BANDWIDTH=' + parseInt(quality.bitrate) * 1000 +
              ',RESOLUTION=' + quality.resolution +
              ',AUDIO="audio"'
            );
            masterPlaylist.push(path.join(quality.resolution, 'playlist.m3u8'));
            resolve();
          })
          .on('error', (err) => reject(new AppError('HLS generation failed: ' + err.message, 500)))
          .run();
      });
    });

    await Promise.all(qualityPromises);

    // Write master playlist
    const masterPath = path.join(outputDir, 'master.m3u8');
    await fs.writeFile(masterPath, masterPlaylist.join('\n'));

    return masterPath;
  }

  static async extractAudio(videoPath, outputPath, options = {}) {
    const {
      format = 'mp3',
      bitrate = '192k',
      sampleRate = 48000,
      channels = 2
    } = options;

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .toFormat(format)
        .audioCodec(this.getAudioCodec(format))
        .audioBitrate(bitrate)
        .audioChannels(channels)
        .audioFrequency(sampleRate)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new AppError('Audio extraction failed: ' + err.message, 500)))
        .run();
    });
  }

  static async generateAudioPreview(audioPath, outputPath, duration = 30) {
    return new Promise((resolve, reject) => {
      ffmpeg(audioPath)
        .setStartTime(0)
        .setDuration(duration)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new AppError('Audio preview generation failed: ' + err.message, 500)))
        .run();
    });
  }

  static getAudioCodec(format) {
    const codecs = {
      'mp3': 'libmp3lame',
      'aac': 'aac',
      'flac': 'flac',
      'wav': 'pcm_s16le'
    };
    return codecs[format] || 'libmp3lame';
  }

  static async optimizeVideo(inputPath, outputPath, options = {}) {
    const {
      videoBitrate = '2000k',
      audioBitrate = '192k',
      width = 1280,
      height = 720,
      fps = 30
    } = options;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .addOptions([
          '-preset medium',
          '-movflags +faststart',
          '-profile:v high',
          '-level:v 4.0'
        ])
        .size(`${width}x${height}`)
        .videoBitrate(videoBitrate)
        .audioBitrate(audioBitrate)
        .fps(fps)
        .on('progress', progress => {
          // Report progress if needed
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new AppError('Video optimization failed: ' + err.message, 500)))
        .save(outputPath);
    });
  }
}

module.exports = MediaProcessor;