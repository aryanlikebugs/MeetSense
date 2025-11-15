import { apiClient } from './api';

export const meetingService = {
  async createMeeting({ topic }) {
    return apiClient.post('/meetings/create', { topic });
  },

  async getMeeting(meetingId) {
    return apiClient.get(`/meetings/${meetingId}`);
  },

  async getUserMeetings(userId) {
    return apiClient.get(`/meetings/history/${userId}`);
  },

  async joinMeeting(meetingId) {
    return apiClient.post(`/meetings/join`, { meetingId });
  },

  async leaveMeeting(meetingId) {
    return apiClient.patch(`/meetings/leave/${meetingId}`, {});
  },

  async endMeeting(meetingId) {
    return apiClient.post(`/meetings/${meetingId}/end`, {});
  },

  async generateNotes(meetingId) {
    return apiClient.post(`/meetings/${meetingId}/generate-notes`, {});
  },

  // Placeholders for future backend features
  async sendMessage() {
    throw new Error('sendMessage not implemented on backend');
  },

  async updateExpression() {
    throw new Error('updateExpression not implemented on backend');
  },
};
