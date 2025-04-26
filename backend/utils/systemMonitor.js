const diskSpace = require('disk-space');
const os = require('os');
const { EventEmitter } = require('events');

class SystemMonitor extends EventEmitter {
  static HISTORY_LENGTH = 60; // Keep last 60 measurements
  static MONITORING_INTERVAL = 60000; // 1 minute

  constructor() {
    super();
    this.metricsHistory = [];
    this.intervalId = null;
  }

  start() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.collectMetrics(), SystemMonitor.MONITORING_INTERVAL);
      this.collectMetrics(); // Initial collection
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async collectMetrics() {
    try {
      const metrics = await this.getSystemMetrics();
      this.metricsHistory.push({
        timestamp: new Date(),
        ...metrics
      });

      // Keep only the last HISTORY_LENGTH measurements
      if (this.metricsHistory.length > SystemMonitor.HISTORY_LENGTH) {
        this.metricsHistory.shift();
      }

      this.emit('metrics', metrics);
    } catch (error) {
      console.error('Error collecting system metrics:', error);
    }
  }

  getMetricsHistory() {
    return this.metricsHistory;
  }

  getLatestMetrics() {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }

  async getSystemMetrics() {
    const [diskMetrics, memoryMetrics, cpuMetrics] = await Promise.all([
      this.getDiskMetrics(),
      this.getMemoryMetrics(),
      this.getCPUMetrics()
    ]);

    return {
      disk: diskMetrics,
      memory: memoryMetrics,
      cpu: cpuMetrics,
      uptime: os.uptime(),
      loadAverage: os.loadavg()
    };
  }

  async getDiskMetrics() {
    const mediaPath = process.env.MEDIA_PATH || './uploads/media';
    const { free, size } = await diskSpace(mediaPath);
    
    return {
      total: size,
      free: free,
      used: size - free,
      usedPercentage: ((size - free) / size) * 100
    };
  }

  getMemoryMetrics() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;

    return {
      total,
      free,
      used,
      usedPercentage: (used / total) * 100
    };
  }

  getCPUMetrics() {
    const cpus = os.cpus();
    const totalTimes = cpus.reduce((acc, cpu) => {
      for (let type in cpu.times) {
        acc[type] = (acc[type] || 0) + cpu.times[type];
      }
      return acc;
    }, {});

    const total = Object.values(totalTimes).reduce((acc, time) => acc + time, 0);
    const idle = totalTimes.idle;

    return {
      cores: cpus.length,
      utilization: ((total - idle) / total) * 100,
      model: cpus[0].model,
      speed: cpus[0].speed
    };
  }
}

// Create a singleton instance
const systemMonitor = new SystemMonitor();
module.exports = systemMonitor;