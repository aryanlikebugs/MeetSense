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
    // Use findOneAndUpdate with atomic operations to avoid version conflicts
    const meeting = await Meeting.findOneAndUpdate(
      { _id: meetingId },
      {
        $setOnInsert: { participants: [] }
      },
      { new: true, upsert: false }
    );
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    
    // Check if participant exists
    const existingParticipant = meeting.participants.find(p => String(p.userId) === String(req.user.id));
    
    if (!existingParticipant) {
      // Add new participant atomically
      await Meeting.findByIdAndUpdate(meetingId, {
        $push: {
          participants: {
            userId: req.user.id,
            joinTimes: [new Date()],
            leaveTimes: [],
            reconnectCount: 0
          }
        }
      });
    } else {
      // Update existing participant's joinTimes atomically
      await Meeting.findOneAndUpdate(
        { _id: meetingId, 'participants.userId': req.user.id },
        {
          $push: { 'participants.$.joinTimes': new Date() }
        }
      );
    }
    
    // Fetch the updated meeting with populated participants
    const updatedMeeting = await Meeting.findById(meetingId).populate('participants.userId', 'name email avatar');
    res.json(updatedMeeting);
  } catch (err) { 
    console.error('Join meeting error:', err);
    next(err); 
  }
};

// PATCH /api/meetings/leave/:id
export const leaveMeeting = async (req, res, next) => {
  try {
    // Use atomic update to avoid version conflicts
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, 'participants.userId': req.user.id },
      {
        $push: { 'participants.$.leaveTimes': new Date() }
      },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ message: 'Meeting not found or not joined' });
    res.json({ message: 'Left meeting' });
  } catch (err) { 
    console.error('Leave meeting error:', err);
    next(err); 
  }
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
    const meeting = await Meeting.findById(req.params.id).select('messages').populate('messages.senderId', 'name email avatar');
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json(meeting.messages || []);
  } catch (err) { next(err); }
};
