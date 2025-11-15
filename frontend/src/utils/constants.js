export const APP_NAME = 'MeetSense';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  CREATE_MEETING: '/create-meeting',
  JOIN_MEETING: '/join-meeting',
  MEETING_ROOM: '/meeting/:meetingId',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
};

export const EXPRESSIONS = [
  { label: 'Happy', color: '#22c55e', emoji: '😊' },
  { label: 'Neutral', color: '#3b82f6', emoji: '😐' },
  { label: 'Confused', color: '#f97316', emoji: '😕' },
  { label: 'Surprised', color: '#a855f7', emoji: '😲' },
  { label: 'Bored', color: '#ef4444', emoji: '😴' },
];

export const MEETING_CONTROLS = {
  MUTE: 'mute',
  VIDEO: 'video',
  SHARE: 'share',
  CHAT: 'chat',
  LEAVE: 'leave',
  RECORD: 'record',
};

export const MOCK_ANALYTICS = {
  totalMeetings: 24,
  avgDuration: '45 min',
  totalParticipants: 156,
  engagementRate: '87%',
};
