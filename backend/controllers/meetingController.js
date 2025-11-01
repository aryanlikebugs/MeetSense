// Frontend: src/services/meetingService.js
import Meeting from '../models/Meeting.js';

// POST /api/meetings/create
export const createMeeting = async (req, res, next) => {
  try {
    const { topic } = req.body;
    const meeting = await Meeting.create({
      host: req.user.id,
      topic,
      participants: [{ userId: req.user.id, joinTimes: [new Date()], leaveTimes: [], reconnectCount: 0 }]
    });
    res.status(201).json(meeting);
  } catch (err) { next(err); }
};

// GET /api/meetings/:id
export const getMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id).populate('participants.userId', 'name email');
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json(meeting);
  } catch (err) { next(err); }
};

// POST /api/meetings/join
export const joinMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.body;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    let participant = meeting.participants.find(p => p.userId.equals(req.user.id));
    if (!participant) {
      meeting.participants.push({ userId: req.user.id, joinTimes: [new Date()], leaveTimes: [], reconnectCount: 0 });
    } else {
      participant.joinTimes.push(new Date());
    }
    await meeting.save();
    res.json(meeting);
  } catch (err) { next(err); }
};

// PATCH /api/meetings/leave/:id
export const leaveMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    const participant = meeting.participants.find(p => p.userId.equals(req.user.id));
    if (!participant) return res.status(400).json({ message: 'Not joined' });
    participant.leaveTimes.push(new Date());
    await meeting.save();
    res.json({ message: 'Left meeting' });
  } catch (err) { next(err); }
};

// GET /api/meetings/history/:userId
export const getUserMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ 'participants.userId': req.params.userId }).sort({ createdAt: -1 });
    res.json(meetings);
  } catch (err) { next(err); }
};

// POST /api/meetings/:id/end (host only)
export const endMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (String(meeting.host) !== String(req.user.id)) return res.status(403).json({ message: 'Only host can end meeting' });
    meeting.endedAt = new Date();
    await meeting.save();
    res.json({ message: 'Meeting ended' });
  } catch (err) { next(err); }
};

// GET /api/meetings/:id/messages
export const getMessages = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id).select('messages');
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json(meeting.messages || []);
  } catch (err) { next(err); }
};
