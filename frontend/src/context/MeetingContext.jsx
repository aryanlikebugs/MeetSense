import { createContext, useEffect, useState, useRef } from 'react';
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
  const [transcript, setTranscript] = useState([]);
  const [asrReady, setAsrReady] = useState(false);
  const mrRef = useRef(null);

  useEffect(() => {
    if (!socket || !activeMeeting?._id) return;

    const getId = (p) => String(p?.userId?._id || p?.userId || p?._id || p?.id);
    const onJoined = (payload) => {
      setParticipants((prev) => {
        const joiningId = String(payload.user?.id || payload.user?._id);
        if (!joiningId) return prev;
        const exists = prev.some(p => getId(p) === joiningId);
        if (exists) return prev;
        return [...prev, { 
          userId: payload.user?.id || payload.user?._id,
          name: payload.user?.name
        }];
      });
    };
    const onLeft = ({ userId }) => {
      setParticipants((prev) => prev.filter(p => String(p?.userId?._id || p?.userId || p?._id || p?.id) !== String(userId)));
    };
    const onDisconnected = ({ userId }) => {
      // keep but mark inactive (optional)
    };
    const onChat = (msg) => {
      const senderIdStr = String(msg.senderId?._id || msg.senderId);
      const isCurrentUser = senderIdStr === String(user?._id || user?.id);
      
      // Try to get sender name from various sources
      let senderName = 'Participant';
      if (isCurrentUser) {
        senderName = 'You';
      } else if (msg.senderId?.name) {
        senderName = msg.senderId.name;
      } else if (msg.senderName) {
        senderName = msg.senderName;
      }
      
      setChatMessages((prev) => {
        // Prevent duplicate messages
        const exists = prev.some(m => m.id === `${senderIdStr}-${msg.ts}`);
        if (exists) return prev;
        return [...prev, {
          id: `${senderIdStr}-${msg.ts}`,
          text: msg.text,
          senderId: isCurrentUser ? 'current-user' : senderIdStr,
          senderName,
          timestamp: msg.ts,
        }];
      });
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
      setTranscript([]);
      setAsrReady(false);
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
      // Always capture mic if audio=true
      const constraints = {
        video,
        audio: audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[client] startMediaStream: audioTracks=', stream.getAudioTracks().length, 'videoTracks=', stream.getVideoTracks().length);
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
      // Normalize participants to a consistent structure to avoid duplicates
      setParticipants((meeting.participants || []).map(p => ({
        userId: p?.userId?._id || p?.userId || p?._id || p?.id,
        name: p?.userId?.name || p?.name,
        avatar: p?.userId?.avatar || p?.avatar,
      })));
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
      // Normalize participants to a consistent structure to avoid duplicates
      setParticipants((res.participants || []).map(p => ({
        userId: p?.userId?._id || p?.userId || p?._id || p?.id,
        name: p?.userId?.name || p?.name,
        avatar: p?.userId?.avatar || p?.avatar,
      })));
      if (connectToMeeting) connectToMeeting(meetingId);
      if (socket) socket.emit('join-meeting', { meetingId, user });
      // load past messages
      try {
        const msgs = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + `/meetings/${meetingId}/messages`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('meetsense_token')}` }
        }).then(r => r.json());
        setChatMessages(msgs.map(m => {
          const senderIdStr = String(m.senderId?._id || m.senderId);
          const isCurrentUser = senderIdStr === String(user?._id || user?.id);
          return {
            id: `${senderIdStr}-${m.ts}`,
            text: m.text,
            senderId: isCurrentUser ? 'current-user' : senderIdStr,
            senderName: isCurrentUser ? 'You' : (m.senderId?.name || 'Participant'),
            timestamp: m.ts
          };
        }));
      } catch (err) {
        console.error('Failed to load past messages:', err);
      }
      return res;
    } catch (error) {
      console.error('Join meeting error:', error);
      throw error;
    }
  };

  const leaveMeeting = async () => {
    try {
      stopMediaStream();
      if (activeMeeting?._id) {
        // Emit socket leave first, then call API
        if (socket) {
          socket.emit('leave-meeting', { meetingId: activeMeeting._id });
          socket.emit('end-meeting', { meetingId: activeMeeting._id });
        }
        // Call API leave endpoint (don't wait if it fails)
        await meetingService.leaveMeeting(activeMeeting._id).catch(err => {
          console.error('Leave meeting API error (non-critical):', err);
        });
      }
    } catch (error) {
      console.error('Leave meeting error:', error);
    } finally {
      // Always clear state even if API call fails
      setActiveMeeting(null);
      setParticipants([]);
      setChatMessages([]);
      setExpressions({});
      setReactions({});
      setTranscript([]);
      setAsrReady(false);
      setIsMuted(false);
      setIsVideoOff(false);
      setIsScreenSharing(false);
    }
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
        const stream = await startMediaStream(true, true); // always request mic; we'll mute via track.enabled
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
        const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }); // display audio is unreliable
        // Ensure we also have a mic track
        const mic = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });

        const combined = new MediaStream([
          ...display.getVideoTracks(),
          ...mic.getAudioTracks()
        ]);

        console.log('[client] screen share: display video=', display.getVideoTracks().length, 'display audio=', display.getAudioTracks().length, 'mic=', mic.getAudioTracks().length);
        setLocalStream(combined);
        setIsScreenSharing(true);

        // When user stops screen share
        display.getVideoTracks()[0].addEventListener('ended', () => {
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
    if (!activeMeeting?._id || !socket || !user) return;
    socket.emit('chat-message', { 
      meetingId: activeMeeting._id, 
      text: message,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
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

  // Listen for ASR readiness
  useEffect(() => {
    if (!socket || !activeMeeting?._id) return;

    const onReady = (payload) => {
      console.log('[client] asr-ready for', payload);
      // Be lenient in comparison (ObjectId vs string)
      if (!payload?.meetingId) return;
      if (String(payload.meetingId) !== String(activeMeeting._id)) return;
      // stop any existing recorder so we will recreate a fresh one
      try { if (mrRef.current && mrRef.current.state !== 'inactive') mrRef.current.stop(); } catch {}
      setAsrReady(true);
    };

    socket.on('asr-ready', onReady);

    return () => {
      socket.off('asr-ready', onReady);
      setAsrReady(false); // Reset when leaving meeting
    };
  }, [socket, activeMeeting?._id]);

  // We no longer use a fallback - we MUST wait for 'asr-ready' from the server
  // to ensure we send the WebM header as the first chunk

  // MediaRecorder for transcript streaming - START ONLY AFTER ASR IS READY
  useEffect(() => {
    if (!socket || !activeMeeting?._id || !localStream || !asrReady) return;

    const audioTracks = localStream.getAudioTracks();
    console.log('[client] recorder: audioTracks =', audioTracks.length, 'videoTracks=', localStream.getVideoTracks().length);
    if (!audioTracks.length) {
      console.warn('[client] recorder: no audio tracks — cannot stream to ASR');
      return;
    }

    const audioOnlyStream = new MediaStream(audioTracks);
    const preferred = 'audio/webm;codecs=opus';
    const mimeType = MediaRecorder.isTypeSupported(preferred) ? preferred : 'audio/webm';

    const mr = new MediaRecorder(audioOnlyStream, { mimeType, audioBitsPerSecond: 24000 });
    mrRef.current = mr;

    mr.ondataavailable = async (e) => {
      if (!e.data || !e.data.size) return;
      const buf = await e.data.arrayBuffer();
      console.log('[client] chunk', e.data.size);
      socket.emit('audio-chunk', {
        meetingId: activeMeeting._id,
        userId: user?._id,
        username: user?.name,
        codec: 'webm-opus',
        blob: new Uint8Array(buf),
      });
    };

    // Start AFTER DG is ready; small timeslice so header arrives fast
    mr.start(150);
    console.log('[client] MediaRecorder started (audio-only, 150ms)');

    // Force an early flush — helps ensure the init segment/header is sent immediately
    const flush = setTimeout(() => {
      try { mr.requestData(); } catch {}
    }, 50);

    const onUpdate = (line) => setTranscript((prev) => [...prev, line]);
    socket.on('transcript-update', onUpdate);

    return () => {
      clearTimeout(flush);
      try { if (mr.state !== 'inactive') mr.stop(); } catch {}
      socket.off('transcript-update', onUpdate);
    };
  }, [socket, activeMeeting?._id, localStream, asrReady, user?._id, user?.name]);

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
    transcript,
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
