import api from './api';
import type { PaginationParams } from '../types/common';

export const requestService = {
  async createRequest(request: string) {
    const response = await api.post('/requests', { request });
    return response.data;
  },

  async getAllRequests(params: PaginationParams) {
    const response = await api.get('/requests', { params });
    return response.data;
  },

  async getUserRequests(params: PaginationParams) {
    const response = await api.get('/requests/my-requests', { params });
    return response.data;
  },

  async updateRequestStatus(id: string, status: string, adminResponse?: string) {
    const response = await api.patch(`/requests/${id}`, { status, adminResponse });
    return response.data;
  }
};

export default requestService;