import api from './api';
import type { PaginationParams } from '../types/common';
import type { StartDownloadParams } from '../types/downloads';

export const downloadService = {
  async startDownload(params: StartDownloadParams) {
    const response = await api.post('/downloads', params);
    return response.data;
  },

  async getStatus(id: string) {
    const response = await api.get(`/downloads/${id}`);
    return response.data;
  },

  async cancelDownload(id: string) {
    const response = await api.delete(`/downloads/${id}`);
    return response.data;
  },

  async getAllDownloads(params: PaginationParams) {
    const response = await api.get('/downloads', { params });
    return response.data;
  }
};

export default downloadService;