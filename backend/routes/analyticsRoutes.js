import express from 'express';
import {
  getMeetingAnalytics,
  updateAnalytics,
  getUserAnalytics
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Frontend: src/services/analyticsService.js
router.get('/:meetingId', protect, getMeetingAnalytics);
router.post('/update', protect, updateAnalytics);
router.get('/summary/:userId', protect, getUserAnalytics);

export default router;
