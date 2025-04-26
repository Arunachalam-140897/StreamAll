const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const { PersonalVault } = require('../models');
const { AppError } = require('../utils/errorHandler');

class PersonalVaultService {
  // Using static class to maintain encapsulation without private methods
  static ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  static IV_LENGTH = 16;
  static AUTH_TAG_LENGTH = 16;
  static SALT_LENGTH = 64;
  static KEY_LENGTH = 32;

  static async addItem(userId, file, type, isEncrypted = false) {
    const vaultDir = path.resolve(process.env.VAULT_PATH || './uploads/vault');
    await fs.ensureDir(vaultDir);

    const fileName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    const filePath = path.join(vaultDir, fileName);

    if (isEncrypted) {
      await this._encryptFile(file.path, filePath);
    } else {
      await fs.move(file.path, filePath);
    }

    return PersonalVault.create({
      ownerId: userId,
      mediaPath: fileName,
      type,
      isEncrypted,
      metadata: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
      }
    });
  }

  static async getItem(itemId, userId) {
    const item = await PersonalVault.findOne({
      _id: itemId,
      ownerId: userId
    });

    if (!item) {
      throw new AppError('Vault item not found', 404);
    }

    const vaultDir = path.resolve(process.env.VAULT_PATH || './uploads/vault');
    const filePath = path.join(vaultDir, item.mediaPath);

    if (!await fs.pathExists(filePath)) {
      throw new AppError('File not found in vault', 404);
    }

    if (item.isEncrypted) {
      const tempDir = path.join(vaultDir, 'temp');
      await fs.ensureDir(tempDir);
      const tempPath = path.join(tempDir, `dec_${path.basename(item.mediaPath)}`);
      
      await this._decryptFile(filePath, tempPath);
      item.tempPath = tempPath;

      // Schedule cleanup of decrypted file
      setTimeout(async () => {
        try {
          await fs.remove(tempPath);
        } catch (error) {
          console.error('Error cleaning up temp file:', error);
        }
      }, 5 * 60 * 1000); // 5 minutes
    }

    return item;
  }

  static async getAllItems(userId, options = {}) {
    const { page = 1, limit = 20, type } = options;
    const query = { ownerId: userId };
    if (type) query.type = type;

    return PersonalVault.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  static async deleteItem(itemId, userId) {
    const item = await PersonalVault.findOne({
      _id: itemId,
      ownerId: userId
    });

    if (!item) {
      throw new AppError('Vault item not found', 404);
    }

    const vaultDir = path.resolve(process.env.VAULT_PATH || './uploads/vault');
    const filePath = path.join(vaultDir, item.mediaPath);

    try {
      await fs.remove(filePath);
      await item.deleteOne();
      return { message: 'Vault item deleted successfully' };
    } catch (error) {
      throw new AppError('Error deleting vault item', 500);
    }
  }

  static async _encryptFile(sourcePath, destPath) {
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const key = crypto.scryptSync(process.env.VAULT_SECRET, salt, this.KEY_LENGTH);
    const cipher = crypto.createCipheriv(this.ENCRYPTION_ALGORITHM, key, iv);
    
    const input = fs.createReadStream(sourcePath);
    const output = fs.createWriteStream(destPath);

    // Write salt and IV at the beginning of the file
    output.write(salt);
    output.write(iv);

    return new Promise((resolve, reject) => {
      input.pipe(cipher).pipe(output);
      
      output.on('finish', () => {
        // Write auth tag at the end of the file
        output.write(cipher.getAuthTag());
        resolve();
      });
      
      output.on('error', reject);
    });
  }

  static async _decryptFile(sourcePath, destPath) {
    const input = fs.createReadStream(sourcePath);
    const output = fs.createWriteStream(destPath);

    return new Promise((resolve, reject) => {
      // Read salt and IV from the beginning of the file
      input.once('readable', async () => {
        try {
          const salt = input.read(this.SALT_LENGTH);
          const iv = input.read(this.IV_LENGTH);
          
          if (!salt || !iv) {
            throw new Error('Invalid encrypted file format');
          }

          const key = crypto.scryptSync(process.env.VAULT_SECRET, salt, this.KEY_LENGTH);
          const decipher = crypto.createDecipheriv(this.ENCRYPTION_ALGORITHM, key, iv);

          // Read auth tag from the end of the file
          const stat = await fs.stat(sourcePath);
          const authTag = (await fs.readFile(sourcePath)).slice(-this.AUTH_TAG_LENGTH);
          decipher.setAuthTag(authTag);

          input.pipe(decipher).pipe(output);
          
          output.on('finish', resolve);
          output.on('error', reject);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

module.exports = PersonalVaultService;