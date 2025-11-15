import { apiClient } from './api';

export const emotionAnalyticsService = {
  async getMeetingEmotions(meetingId) {
    return apiClient.get(`/emotion-analytics/emotion/${meetingId}`);
  },
};
