const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { AppError } = require('./errorHandler');

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  const dirs = [
    './tmp/uploads',
    './uploads/media',
    './uploads/media/thumbnails',
    './uploads/vault',
    './uploads/vault/temp',
    './backups'
  ].map(dir => path.resolve(process.cwd(), dir));

  await Promise.all(dirs.map(dir => fs.ensureDir(dir)));
};

// Initialize directories
ensureUploadDirs().catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'tmp', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    // Video formats
    'video/mp4': '.mp4',
    'video/x-matroska': '.mkv',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    // Audio formats
    'audio/mpeg': '.mp3',
    'audio/flac': '.flac',
    'audio/wav': '.wav',
    'audio/aac': '.aac',
    // Image formats (for thumbnails and vault)
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    // Backup files
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip',
    // Torrent files
    'application/x-bittorrent': '.torrent'
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type. Allowed types: ${Object.keys(allowedTypes).join(', ')}`, 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 1024 * 1024 * 1024 * 2 // 2GB default
  }
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 2GB', 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
};

// Clean up temp files periodically
const cleanupTempFiles = async () => {
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
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Run cleanup every 12 hours
setInterval(cleanupTempFiles, 12 * 60 * 60 * 1000);

module.exports = {
  upload,
  handleUploadError
};