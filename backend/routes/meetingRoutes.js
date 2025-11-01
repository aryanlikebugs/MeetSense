import express from 'express';
import {
  createMeeting,
  getMeeting,
  joinMeeting,
  leaveMeeting,
  getUserMeetings,
  endMeeting,
  getMessages
} from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Frontend: src/services/meetingService.js
router.post('/create', protect, createMeeting);
router.get('/:id', protect, getMeeting);
router.post('/join', protect, joinMeeting);
router.patch('/leave/:id', protect, leaveMeeting);
router.get('/history/:userId', protect, getUserMeetings);
router.post('/:id/end', protect, endMeeting);
router.get('/:id/messages', protect, getMessages);

export default router;
