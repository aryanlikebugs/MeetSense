import { createContext, useEffect, useState } from 'react';
import { meetingService } from '../services/meetingService';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from './SocketContext';

export const MeetingContext = createContext();

export const MeetingProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, connectToMeeting } = useSocket() || {};

  const [activeMeeting, setActiveMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [expressions, setExpressions] = useState({});

  useEffect(() => {
    if (!socket || !activeMeeting?._id) return;

    const onJoined = (payload) => {
      setParticipants((prev) => {
        const exists = prev.some(p => String(p.userId || p._id) === String(payload.user?.id || payload.user?._id));
        if (exists) return prev;
        return [...prev, { userId: payload.user?.id, name: payload.user?.name }];
      });
    };
    const onLeft = ({ userId }) => {
      setParticipants((prev) => prev.filter(p => String(p.userId || p._id) !== String(userId)));
    };
    const onDisconnected = ({ userId }) => {
      // keep but mark inactive (optional)
    };
    const onChat = (msg) => {
      setChatMessages((prev) => [...prev, {
        id: `${msg.senderId}-${msg.ts}`,
        text: msg.text,
        senderId: String(msg.senderId) === String(user?._id) ? 'current-user' : msg.senderId,
        senderName: String(msg.senderId) === String(user?._id) ? 'You' : 'Participant',
        timestamp: msg.ts,
      }]);
    };

    socket.on('participant-joined', onJoined);
    socket.on('participant-left', onLeft);
    socket.on('participant-disconnected', onDisconnected);
    socket.on('chat-message', onChat);
    socket.on('meeting-ended', () => {
      setActiveMeeting(null);
      setParticipants([]);
    });

    return () => {
      socket.off('participant-joined', onJoined);
      socket.off('participant-left', onLeft);
      socket.off('participant-disconnected', onDisconnected);
      socket.off('chat-message', onChat);
      socket.off('meeting-ended');
    };
  }, [socket, activeMeeting?._id, user?._id]);

  const createMeeting = async ({ topic }) => {
    const meeting = await meetingService.createMeeting({ topic });
    setActiveMeeting(meeting);
    setParticipants(meeting.participants || []);
    return meeting;
  };

  const joinMeeting = async (meetingId) => {
    const res = await meetingService.joinMeeting(meetingId);
    setActiveMeeting(res);
    setParticipants(res.participants || []);
    if (connectToMeeting) connectToMeeting(meetingId);
    if (socket) socket.emit('join-meeting', { meetingId, user });
    // load past messages
    try {
      const msgs = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + `/meetings/${meetingId}/messages`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('meetsense_token')}` }
      }).then(r => r.json());
      setChatMessages(msgs.map(m => ({ id: `${m.senderId}-${m.ts}`, text: m.text, senderId: String(m.senderId) === String(user?._id) ? 'current-user' : m.senderId, senderName: String(m.senderId) === String(user?._id) ? 'You' : 'Participant', timestamp: m.ts })));
    } catch {}
    return res;
  };

  const leaveMeeting = async () => {
    if (activeMeeting?._id) {
      await meetingService.leaveMeeting(activeMeeting._id);
      if (socket) socket.emit('leave-meeting', { meetingId: activeMeeting._id });
    }
    setActiveMeeting(null);
    setParticipants([]);
    setChatMessages([]);
    setExpressions({});
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  const sendMessage = (message) => {
    if (!activeMeeting?._id || !socket) return;
    socket.emit('chat-message', { meetingId: activeMeeting._id, text: message });
  };

  const updateExpression = (participantId, expression) => {
    setExpressions((prev) => ({
      ...prev,
      [participantId]: { type: expression, timestamp: new Date().toISOString() },
    }));
  };

  const value = {
    activeMeeting,
    participants,
    isMuted,
    isVideoOff,
    isScreenSharing,
    chatMessages,
    expressions,
    createMeeting,
    joinMeeting,
    leaveMeeting,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendMessage,
    updateExpression,
  };

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
};
