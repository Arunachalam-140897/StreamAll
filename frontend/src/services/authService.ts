import api from './api';
import type { LoginCredentials } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
};

export default authService;