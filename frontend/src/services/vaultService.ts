import api from './api';
import type { PaginationParams } from '../types/common';
import type { VaultItem } from '../types/vault';

export const vaultService = {
  async getItems(params: PaginationParams & { type?: string }) {
    const response = await api.get('/vault', { params });
    return response.data;
  },

  async addItem(formData: FormData) {
    const response = await api.post('/vault', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async getItem(id: string) {
    const response = await api.get(`/vault/${id}`);
    return response.data;
  },

  async getItemStream(id: string) {
    const response = await api.get(`/vault/${id}`, { responseType: 'blob' });
    return response.data;
  },

  async deleteItem(id: string) {
    const response = await api.delete(`/vault/${id}`);
    return response.data;
  }
};

export default vaultService;