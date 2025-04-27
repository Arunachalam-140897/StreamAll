import api from './api';

export const systemService = {
  async getMetrics() {
    const response = await api.get('/system/metrics/latest');
    return response.data;
  },

  async getDownloadStats() {
    const response = await api.get('/system/downloads/stats');
    return response.data;
  },

  async pauseDownloads() {
    const response = await api.post('/system/downloads/pause');
    return response.data;
  },

  async resumeDownloads() {
    const response = await api.post('/system/downloads/resume');
    return response.data;
  },

  async purgeDownloads() {
    const response = await api.post('/system/downloads/purge');
    return response.data;
  },

  async createBackup() {
    const response = await api.get('/backup/download', {
      responseType: 'blob'
    });
    return response.data;
  },

  async restoreBackup(formData: FormData) {
    const response = await api.post('/backup/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default systemService;