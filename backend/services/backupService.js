const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const { AppError } = require('../utils/errorHandler');

class BackupService {
  static async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.resolve(process.env.BACKUP_PATH || './backups', timestamp);
    await fs.ensureDir(backupDir);

    try {
      // Backup database
      await this.backupDatabase(backupDir);
      
      // Backup media files
      await this.backupMedia(backupDir);

      // Create zip archive
      const zipPath = `${backupDir}.zip`;
      await this.createZipArchive(backupDir, zipPath);

      // Clean up temporary directory
      await fs.remove(backupDir);

      return zipPath;
    } catch (error) {
      await fs.remove(backupDir);
      throw new AppError('Backup failed: ' + error.message, 500);
    }
  }

  static async backupDatabase(backupDir) {
    const dbConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 27017,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS
    };

    return new Promise((resolve, reject) => {
      const dumpFile = path.join(backupDir, 'database');
      const mongodump = spawn('mongodump', [
        '--host', dbConfig.host,
        '--port', dbConfig.port.toString(),
        '--db', dbConfig.database,
        '--username', dbConfig.user,
        '--password', dbConfig.password,
        '--out', dumpFile,
        '--gzip'
      ]);

      mongodump.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`mongodump exited with code ${code}`));
      });

      mongodump.on('error', reject);
    });
  }

  static async backupMedia(backupDir) {
    const mediaDir = path.resolve(process.env.MEDIA_PATH || './uploads/media');
    const mediaBackupDir = path.join(backupDir, 'media');
    await fs.copy(mediaDir, mediaBackupDir);
  }

  static async createZipArchive(sourceDir, zipPath) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  static async restore(backupPath) {
    const restoreDir = path.join(path.dirname(backupPath), 'restore_temp');
    await fs.ensureDir(restoreDir);

    try {
      // Extract backup
      await this.extractBackup(backupPath, restoreDir);

      // Restore database
      await this.restoreDatabase(path.join(restoreDir, 'database', process.env.DB_NAME));

      // Restore media files
      await this.restoreMedia(path.join(restoreDir, 'media'));

      // Clean up
      await fs.remove(restoreDir);
    } catch (error) {
      await fs.remove(restoreDir);
      throw new AppError('Restore failed: ' + error.message, 500);
    }
  }

  static async extractBackup(backupPath, restoreDir) {
    const extract = require('extract-zip');
    await extract(backupPath, { dir: restoreDir });
  }

  static async restoreDatabase(dumpDir) {
    const dbConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 27017,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS
    };

    return new Promise((resolve, reject) => {
      const mongorestore = spawn('mongorestore', [
        '--host', dbConfig.host,
        '--port', dbConfig.port.toString(),
        '--db', dbConfig.database,
        '--username', dbConfig.user,
        '--password', dbConfig.password,
        '--drop', // Drop existing collections before restore
        '--gzip',
        dumpDir
      ]);

      mongorestore.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`mongorestore exited with code ${code}`));
      });

      mongorestore.on('error', reject);
    });
  }

  static async restoreMedia(mediaBackupDir) {
    const mediaDir = path.resolve(process.env.MEDIA_PATH || './uploads/media');
    await fs.emptyDir(mediaDir);
    await fs.copy(mediaBackupDir, mediaDir);
  }
}

module.exports = BackupService;