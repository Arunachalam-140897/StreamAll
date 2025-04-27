import api from './api';
import type { PaginationParams } from '../types/common';

export const notificationService = {
  async getNotifications(params: PaginationParams) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }
};

export default notificationService;