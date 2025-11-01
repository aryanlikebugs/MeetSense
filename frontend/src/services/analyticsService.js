import { apiClient } from './api';

export const analyticsService = {
  async getMeetingAnalytics(meetingId) {
    return apiClient.get(`/analytics/${meetingId}`);
  },

  async updateActivity(payload) {
    return apiClient.post('/analytics/update', payload);
  },

  async getUserSummary(userId) {
    return apiClient.get(`/analytics/summary/${userId}`);
  },
};
