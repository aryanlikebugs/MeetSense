import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import Meeting from '../models/Meeting.js';

const getOrigin = () => process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

export function initSocket(server) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: getOrigin(),
      credentials: true,
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || (socket.handshake.headers?.authorization || '').split(' ')[1];
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id };
      next();
    } catch (e) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id, 'user', socket.user?.id);
    let roomId = null;
    let disconnectAt = null;

    socket.on('join-meeting', async ({ meetingId, user }) => {
      try {
        roomId = meetingId;
        socket.join(meetingId);
        console.log(`User ${socket.user.id} joined meeting ${meetingId}`);

        const meeting = await Meeting.findById(meetingId);
        if (meeting) {
          let participant = meeting.participants.find(p => String(p.userId) === String(socket.user.id));
          if (!participant) {
            participant = { userId: socket.user.id, joinTimes: [], leaveTimes: [], reconnectCount: 0 };
            meeting.participants.push(participant);
          }
          participant.joinTimes.push(new Date());
          if (disconnectAt && (Date.now() - disconnectAt.getTime()) < 120000) {
            participant.reconnectCount = (participant.reconnectCount || 0) + 1;
          }
          await meeting.save();
        }

        io.to(meetingId).emit('participant-joined', { meetingId, user });
      } catch (e) {
        console.error('join-meeting error', e);
        socket.emit('error', { message: 'Failed to join meeting' });
      }
    });

    socket.on('leave-meeting', async ({ meetingId }) => {
      try {
        const meeting = await Meeting.findById(meetingId);
        if (meeting) {
          const participant = meeting.participants.find(p => String(p.userId) === String(socket.user.id));
          if (participant) participant.leaveTimes.push(new Date());
          await meeting.save();
        }
        socket.leave(meetingId);
        io.to(meetingId).emit('participant-left', { userId: socket.user.id, meetingId });
      } catch (e) {
        console.error('leave-meeting error', e);
      }
    });

    socket.on('chat-message', async ({ meetingId, text }) => {
      try {
        const message = { senderId: socket.user.id, text, ts: new Date() };
        await Meeting.findByIdAndUpdate(meetingId, { $push: { messages: message } });
        io.to(meetingId).emit('chat-message', message);
      } catch (e) {
        console.error('chat-message error', e);
      }
    });

    socket.on('host-end-meeting', async ({ meetingId }) => {
      try {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) return;
        if (String(meeting.host) !== String(socket.user.id)) {
          return socket.emit('error', { message: 'Only host can end meeting' });
        }
        meeting.endedAt = new Date();
        await meeting.save();
        io.to(meetingId).emit('meeting-ended', { meetingId });
        const socketsInRoom = await io.in(meetingId).fetchSockets();
        socketsInRoom.forEach(s => s.leave(meetingId));
      } catch (e) {
        console.error('host-end-meeting error', e);
      }
    });

    socket.on('toggle-camera', ({ meetingId, on }) => {
      io.to(meetingId).emit('presence-update', { userId: socket.user.id, cameraOn: on });
    });

    socket.on('toggle-mic', ({ meetingId, on }) => {
      io.to(meetingId).emit('presence-update', { userId: socket.user.id, micOn: on });
    });

    socket.on('reaction', ({ meetingId, reaction }) => {
      io.to(meetingId).emit('reaction', { userId: socket.user.id, reaction });
      console.log(`User ${socket.user.id} reacted with ${reaction} in meeting ${meetingId}`);
    });

    socket.on('disconnect', async () => {
      try {
        disconnectAt = new Date();
        if (roomId) {
          const meeting = await Meeting.findById(roomId);
          if (meeting) {
            const participant = meeting.participants.find(p => String(p.userId) === String(socket.user.id));
            if (participant) participant.leaveTimes.push(new Date());
            await meeting.save();
          }
          io.to(roomId).emit('participant-disconnected', { userId: socket.user.id, meetingId: roomId });
        }
      } catch (e) {
        console.error('disconnect handler error', e);
      }
      console.log('Socket disconnected', socket.id);
    });
  });

  return io;
}
