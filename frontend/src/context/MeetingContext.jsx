import { createContext, useEffect, useState } from 'react';
import { meetingService } from '../services/meetingService';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from './SocketContext';

export const MeetingContext = createContext();

export const MeetingProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, connectToMeeting } = useSocket();

  const [activeMeeting, setActiveMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [expressions, setExpressions] = useState({});
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [reactions, setReactions] = useState({});

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

    const onReaction = ({ userId, reaction }) => {
      setReactions((prev) => ({ ...prev, [userId]: { emoji: reaction, timestamp: Date.now() } }));
      setTimeout(() => {
        setReactions((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }, 3000);
    };

    socket.on('participant-joined', onJoined);
    socket.on('participant-left', onLeft);
    socket.on('participant-disconnected', onDisconnected);
    socket.on('chat-message', onChat);
    socket.on('reaction', onReaction);
    socket.on('meeting-ended', () => {
      setActiveMeeting(null);
      setParticipants([]);
      stopMediaStream();
    });

    return () => {
      socket.off('participant-joined', onJoined);
      socket.off('participant-left', onLeft);
      socket.off('participant-disconnected', onDisconnected);
      socket.off('chat-message', onChat);
      socket.off('reaction', onReaction);
      socket.off('meeting-ended');
    };
  }, [socket, activeMeeting?._id, user?._id]);

  const stopMediaStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const startMediaStream = async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  };

  const createMeeting = async ({ topic }) => {
    try {
      const meeting = await meetingService.createMeeting({ topic });
      if (!meeting || (!meeting._id && !meeting.id)) {
        throw new Error('Invalid meeting response');
      }
      setActiveMeeting(meeting);
      setParticipants(meeting.participants || []);
      return meeting;
    } catch (error) {
      console.error('Create meeting error:', error);
      throw error;
    }
  };

  const joinMeeting = async (meetingId) => {
    try {
      const res = await meetingService.joinMeeting(meetingId);
      if (!res || (!res._id && !res.id)) {
        throw new Error('Invalid meeting response');
      }
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
    } catch (error) {
      console.error('Join meeting error:', error);
      throw error;
    }
  };

  const leaveMeeting = async () => {
    stopMediaStream();
    if (activeMeeting?._id) {
      await meetingService.leaveMeeting(activeMeeting._id);
      if (socket) socket.emit('leave-meeting', { meetingId: activeMeeting._id });
    }
    setActiveMeeting(null);
    setParticipants([]);
    setChatMessages([]);
    setExpressions({});
    setReactions({});
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !newMuted;
      });
    } else if (!newMuted) {
      try {
        const stream = await startMediaStream(false, true);
        if (stream) {
          if (socket && activeMeeting?._id) {
            socket.emit('toggle-mic', { meetingId: activeMeeting._id, on: !newMuted });
          }
        }
      } catch (error) {
        setIsMuted(true);
        console.error('Failed to access microphone:', error);
      }
    } else {
      if (socket && activeMeeting?._id) {
        socket.emit('toggle-mic', { meetingId: activeMeeting._id, on: !newMuted });
      }
    }
  };

  const toggleVideo = async () => {
    const newVideoOff = !isVideoOff;
    setIsVideoOff(newVideoOff);
    
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !newVideoOff;
      });
    } else if (!newVideoOff) {
      try {
        const stream = await startMediaStream(true, isMuted);
        if (stream) {
          if (socket && activeMeeting?._id) {
            socket.emit('toggle-camera', { meetingId: activeMeeting._id, on: !newVideoOff });
          }
        }
      } catch (error) {
        setIsVideoOff(true);
        console.error('Failed to access camera:', error);
      }
    } else {
      if (socket && activeMeeting?._id) {
        socket.emit('toggle-camera', { meetingId: activeMeeting._id, on: !newVideoOff });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopMediaStream();
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setLocalStream(stream);
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
          stopMediaStream();
        });
      } catch (error) {
        console.error('Failed to share screen:', error);
      }
    }
  };

  const sendReaction = (emoji) => {
    if (socket && activeMeeting?._id) {
      socket.emit('reaction', { meetingId: activeMeeting._id, reaction: emoji });
      setReactions((prev) => ({ ...prev, [user?._id]: { emoji, timestamp: Date.now() } }));
      setTimeout(() => {
        setReactions((prev) => {
          const updated = { ...prev };
          delete updated[user?._id];
          return updated;
        });
      }, 3000);
    }
  };

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

  useEffect(() => {
    if (activeMeeting?._id && !localStream && !isVideoOff && !isMuted) {
      startMediaStream(true, true).catch(() => {});
    }
  }, [activeMeeting?._id]);

  const value = {
    activeMeeting,
    participants,
    isMuted,
    isVideoOff,
    isScreenSharing,
    chatMessages,
    expressions,
    reactions,
    localStream,
    remoteStreams,
    createMeeting,
    joinMeeting,
    leaveMeeting,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendMessage,
    sendReaction,
    updateExpression,
  };

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
};
