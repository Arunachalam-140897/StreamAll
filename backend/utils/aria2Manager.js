const Aria2 = require('aria2');
const { AppError } = require('./errorHandler');
const { logError, logInfo } = require('./logger');

class Aria2Manager {
  static instance = null;
  static retryCount = 0;
  static maxRetries = 3;
  static retryDelay = 5000; // 5 seconds

  static async start() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new Aria2({
      host: process.env.ARIA2_HOST || 'localhost',
      port: parseInt(process.env.ARIA2_PORT || '6800'),
      secure: false,
      secret: process.env.ARIA2_SECRET,
      path: '/jsonrpc'
    });

    try {
      await this.instance.open();
      await this.setupAria2();
      this.setupEventHandlers();
      logInfo('Aria2 RPC connection established');
      return this.instance;
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        logError(`Aria2 connection failed, retrying (${this.retryCount}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.start();
      }
      throw new AppError('Failed to connect to Aria2 RPC server', 500);
    }
  }

  static async stop() {
    if (this.instance) {
      try {
        await this.instance.close();
        this.instance = null;
        logInfo('Aria2 RPC connection closed');
      } catch (error) {
        logError('Error closing Aria2 RPC connection:', error);
      }
    }
  }

  static async setupAria2() {
    const options = {
      'max-concurrent-downloads': 3,
      'max-connection-per-server': 16,
      'split': 8,
      'min-split-size': '1M',
      'max-tries': 5,
      'retry-wait': 10,
      'user-agent': 'Mozilla/5.0 StreamCloud/1.0',
      'enable-rpc': true,
      'rpc-listen-all': false,
      'rpc-secret': process.env.ARIA2_SECRET,
      'seed-ratio': 0.0,
      'seed-time': 0,
      'max-file-not-found': 5
    };

    try {
      await this.instance.changeGlobalOption(options);
      logInfo('Aria2 global options configured');
    } catch (error) {
      logError('Failed to configure Aria2 options:', error);
      throw error;
    }
  }

  static setupEventHandlers() {
    this.instance.on('error', error => {
      logError('Aria2 RPC error:', error);
    });

    this.instance.on('close', () => {
      logInfo('Aria2 RPC connection closed');
    });
  }

  static async getStatus() {
    if (!this.instance) {
      throw new AppError('Aria2 RPC not initialized', 500);
    }

    try {
      const version = await this.instance.getVersion();
      const stats = await this.instance.getGlobalStat();
      
      return {
        version: version.version,
        activeDownloads: parseInt(stats.numActive),
        waitingDownloads: parseInt(stats.numWaiting),
        stoppedDownloads: parseInt(stats.numStopped),
        downloadSpeed: parseInt(stats.downloadSpeed),
        uploadSpeed: parseInt(stats.uploadSpeed)
      };
    } catch (error) {
      logError('Failed to get Aria2 status:', error);
      throw new AppError('Failed to get Aria2 status', 500);
    }
  }

  static async purgeDownloads() {
    if (!this.instance) {
      throw new AppError('Aria2 RPC not initialized', 500);
    }

    try {
      await this.instance.purgeDownloadResult();
      logInfo('Purged completed downloads from Aria2');
    } catch (error) {
      logError('Failed to purge downloads:', error);
      throw new AppError('Failed to purge downloads', 500);
    }
  }

  static async pauseAll() {
    if (!this.instance) {
      throw new AppError('Aria2 RPC not initialized', 500);
    }

    try {
      await this.instance.pauseAll();
      logInfo('Paused all downloads');
    } catch (error) {
      logError('Failed to pause downloads:', error);
      throw new AppError('Failed to pause downloads', 500);
    }
  }

  static async resumeAll() {
    if (!this.instance) {
      throw new AppError('Aria2 RPC not initialized', 500);
    }

    try {
      await this.instance.unpauseAll();
      logInfo('Resumed all downloads');
    } catch (error) {
      logError('Failed to resume downloads:', error);
      throw new AppError('Failed to resume downloads', 500);
    }
  }

  static getInstance() {
    if (!this.instance) {
      throw new AppError('Aria2 RPC not initialized', 500);
    }
    return this.instance;
  }
}

module.exports = Aria2Manager;