import { apiClient } from './api';

export const aiNotesService = {
  async getMeetingNotes(meetingId) {
    return apiClient.get(`/ai-notes/meeting/${meetingId}`);
  },
};
