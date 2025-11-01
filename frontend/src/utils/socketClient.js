import { io } from 'socket.io-client';

function getSocketBaseUrl() {
  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return api.replace(/\/?api\/?$/, '');
}

export function createSocket() {
  const token = localStorage.getItem('meetsense_token');
  return io(getSocketBaseUrl(), {
    withCredentials: true,
    transports: ['websocket'],
    auth: { token },
  });
}

export function joinMeetingSocket(socket, meetingId, user) {
  if (!socket || !meetingId) return;
  socket.emit('join-meeting', { meetingId, user });
}
