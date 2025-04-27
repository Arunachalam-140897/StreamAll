import api from './api';
import type { MediaQueryParams } from '../types/media';

export const mediaService = {
  async getAll(params: MediaQueryParams) {
    const response = await api.get('/media', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/media/${id}`);
    return response.data;
  },

  async getStreamUrl(id: string) {
    const response = await api.get(`/media/${id}/stream`);
    return response.data;
  }
};

export default mediaService;