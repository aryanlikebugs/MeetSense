import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js';

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
        
        // Fetch user info from database if not provided
        let userInfo = user;
        if (!userInfo?.name) {
          const dbUser = await User.findById(socket.user.id).select('name email avatar');
          if (dbUser) {
            userInfo = {
              id: dbUser._id,
              _id: dbUser._id,
              name: dbUser.name,
              email: dbUser.email,
              avatar: dbUser.avatar
            };
          }
        }
        
        console.log(`[Socket] User joined: ${userInfo?.name || socket.user.id} (${socket.user.id})`);

        // Use atomic operations to avoid version conflicts with REST API
        const meeting = await Meeting.findById(meetingId);
        if (meeting) {
          const existingParticipant = meeting.participants.find(p => String(p.userId) === String(socket.user.id));
          
          if (!existingParticipant) {
            // Add new participant atomically
            await Meeting.findByIdAndUpdate(meetingId, {
              $push: {
                participants: {
                  userId: socket.user.id,
                  joinTimes: [new Date()],
                  leaveTimes: [],
                  reconnectCount: 0
                }
              }
            });
          } else {
            // Update existing participant atomically
            const updateOp = { $push: { 'participants.$.joinTimes': new Date() } };
            if (disconnectAt && (Date.now() - disconnectAt.getTime()) < 120000) {
              updateOp.$inc = { 'participants.$.reconnectCount': 1 };
            }
            await Meeting.findOneAndUpdate(
              { _id: meetingId, 'participants.userId': socket.user.id },
              updateOp
            );
          }
        }

        io.to(meetingId).emit('participant-joined', { meetingId, user: userInfo || { id: socket.user.id, name: 'Unknown' } });
      } catch (e) {
        console.error('join-meeting socket error', e);
        socket.emit('error', { message: 'Failed to join meeting' });
      }
    });

    socket.on('leave-meeting', async ({ meetingId }) => {
      try {
        // Use atomic update to avoid version conflicts
        await Meeting.findOneAndUpdate(
          { _id: meetingId, 'participants.userId': socket.user.id },
          {
            $push: { 'participants.$.leaveTimes': new Date() }
          }
        );
        socket.leave(meetingId);
        console.log(`[Socket] User left: ${socket.user.id}`);
        io.to(meetingId).emit('participant-left', { userId: socket.user.id, meetingId });
      } catch (e) {
        console.error('leave-meeting socket error', e);
      }
    });

    socket.on('chat-message', async ({ meetingId, text, user }) => {
      try {
        const message = { senderId: socket.user.id, text, ts: new Date() };
        await Meeting.findByIdAndUpdate(meetingId, { $push: { messages: message } });
        
        // Fetch user info from database if not provided
        let senderInfo = user;
        if (!senderInfo?.name) {
          const dbUser = await User.findById(socket.user.id).select('name email avatar');
          if (dbUser) {
            senderInfo = {
              _id: dbUser._id,
              name: dbUser.name,
              email: dbUser.email,
              avatar: dbUser.avatar
            };
          }
        }
        
        const populatedMessage = {
          senderId: {
            _id: socket.user.id,
            name: senderInfo?.name || 'Unknown',
            email: senderInfo?.email,
            avatar: senderInfo?.avatar
          },
          text,
          ts: message.ts
        };
        io.to(meetingId).emit('chat-message', populatedMessage);
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
        // Use atomic update
        await Meeting.findByIdAndUpdate(meetingId, { endedAt: new Date() });
        console.log(`[Socket] Meeting ended by host: ${socket.user.id}`);
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
          // Use atomic update to avoid version conflicts
          await Meeting.findOneAndUpdate(
            { _id: roomId, 'participants.userId': socket.user.id },
            {
              $push: { 'participants.$.leaveTimes': new Date() }
            }
          );
          io.to(roomId).emit('participant-disconnected', { userId: socket.user.id, meetingId: roomId });
          console.log(`[Socket] User disconnected: ${socket.user.id}`);
        }
      } catch (e) {
        console.error('disconnect handler error', e);
      }
      console.log('Socket disconnected', socket.id);
    });
  });

  return io;
}
