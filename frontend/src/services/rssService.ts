import api from './api';
import type { RSSFeed } from '../types/rss';

export const rssService = {
  async getAllFeeds() {
    const response = await api.get('/rss');
    return response.data;
  },

  async addFeed(url: string, label: string) {
    const response = await api.post('/rss', { url, label });
    return response.data;
  },

  async deleteFeed(id: string) {
    const response = await api.delete(`/rss/${id}`);
    return response.data;
  },

  async getFeedItems(id: string) {
    const response = await api.get(`/rss/${id}/items`);
    return response.data;
  }
};

export default rssService;